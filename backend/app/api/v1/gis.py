from fastapi import APIRouter, Request
from app.models.schemas import GISLookupRequest, GISLookupResponse, WardInfo
from app.services.spatial import resolve_ward

router = APIRouter(prefix="/gis", tags=["gis"])

@router.post("/lookup", response_model=GISLookupResponse)
async def gis_lookup(request: Request, lookup: GISLookupRequest):
    pool = request.app.state.pool
    ward = await resolve_ward(pool, lookup.longitude, lookup.latitude)
    
    if ward:
        return GISLookupResponse(
            ward_id=ward['id'],
            ward_name=ward['name'],
            ward_code=ward['code'],
            zone=ward['zone'],
            department=ward['department'],
            confidence='exact_match'
        )
    return GISLookupResponse(
        ward_id=0,
        ward_name='Unknown - Human Review Required',
        ward_code='REVIEW',
        zone='unresolved',
        department='Human Review Queue',
        confidence='no_match'
    )

@router.get("/wards")
async def get_wards(request: Request):
    pool = request.app.state.pool
    query = "SELECT id, name, code, zone, department FROM wards"
    async with pool.acquire() as conn:
        rows = await conn.fetch(query)
        return [dict(r) for r in rows]

@router.get("/wards/{ward_id}/boundary")
async def get_ward_boundary(request: Request, ward_id: int):
    pool = request.app.state.pool
    query = "SELECT id, name, ST_AsGeoJSON(boundary)::json as boundary FROM wards WHERE id = $1"
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, ward_id)
        if row:
            return dict(row)
        return {"error": "Ward not found"}

@router.get("/heatmap")
async def get_heatmap(request: Request, category: str = None, status: str = None):
    pool = request.app.state.pool
    query = """
        SELECT ST_Y(l.coordinates::geometry) as lat, ST_X(l.coordinates::geometry) as lon, c.category
        FROM cases c
        JOIN locations l ON c.id = l.case_id
        WHERE 1=1
    """
    args = []
    if category:
        query += " AND c.category = $1"
        args.append(category)
        
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *args)
        return [{"lat": r['lat'], "lon": r['lon'], "category": r['category']} for r in rows]
