from typing import Optional, List, Dict, Any
from uuid import UUID


async def resolve_ward(pool, lon: float, lat: float) -> Optional[Dict[str, Any]]:
    """Deterministic PostGIS ward resolution using ST_Contains point-in-polygon.
    
    Returns ward dict or None (triggers human review queue on None).
    Target: <300ms, >=99.5% accuracy.
    """
    query = """
        SELECT id, name, code, zone, department
        FROM wards
        WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint($1, $2), 4326))
        LIMIT 1
    """
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, lon, lat)
        if row:
            return dict(row)
        return None


async def find_duplicates(
    pool, lon: float, lat: float, category: str,
    hours: int = 72, radius_m: int = 15
) -> List[Dict[str, Any]]:
    """Search for duplicate cases within radius_m meters and hours time window.
    
    Uses ST_DWithin on geography type for meter-accurate distance.
    Uses make_interval() for safe parameterized interval (asyncpg compatible).
    """
    query = """
        SELECT c.id, c.case_number, c.category, c.status, 
               c.master_case_id, c.community_impact_score,
               ST_Distance(
                   l.coordinates::geography, 
                   ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
               ) as distance_m
        FROM cases c
        JOIN locations l ON l.case_id = c.id
        WHERE ST_DWithin(
                  l.coordinates::geography, 
                  ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
                  $3
              )
          AND c.category = $4
          AND c.reported_at > NOW() - make_interval(hours => $5)
          AND c.status NOT IN ('verified_closed', 'reopened')
        ORDER BY distance_m ASC
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, lon, lat, float(radius_m), category, hours)
        return [dict(r) for r in rows]


async def link_to_master_case(pool, new_case_id: UUID, master_case_id: UUID) -> None:
    """Link a duplicate case to its master and increment community impact score.
    
    Uses transaction to ensure atomic update.
    """
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                "UPDATE cases SET master_case_id = $2, updated_at = NOW() WHERE id = $1",
                new_case_id, master_case_id
            )
            await conn.execute(
                "UPDATE cases SET community_impact_score = community_impact_score + 1, updated_at = NOW() WHERE id = $1",
                master_case_id
            )
