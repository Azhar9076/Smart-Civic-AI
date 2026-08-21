try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    RealDictCursor = None
import json
import os

def get_sync_connection():
    """Get synchronous PostgreSQL connection for Celery workers."""
    db_url = os.getenv("DATABASE_URL", "postgresql://civic_admin:civic_secure_2026@postgres:5432/smart_civic")
    return psycopg2.connect(db_url)

def fetch_case(case_id: str) -> dict:
    with get_sync_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT c.*, 
                       ST_X(l.coordinates::geometry) as longitude,
                       ST_Y(l.coordinates::geometry) as latitude
                FROM cases c
                LEFT JOIN locations l ON l.case_id = c.id
                WHERE c.id = %s
            """, (case_id,))
            return cur.fetchone()

def update_case(case_id: str, updates: dict) -> None:
    if not updates:
        return
    set_clause = ', '.join([f"{k} = %s" for k in updates.keys()])
    values = list(updates.values()) + [case_id]
    with get_sync_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE cases SET {set_clause}, updated_at = NOW() WHERE id = %s",
                values
            )
        conn.commit()

def insert_agent_decision(decision: dict) -> str:
    """Insert into agent_decisions matching schema columns exactly."""
    with get_sync_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO agent_decisions 
                    (case_id, runtime, capability, model_name, model_version,
                     input_summary, output_summary, confidence, reason, action_taken,
                     processing_time_ms)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) 
                RETURNING id
            """, (
                decision.get('case_id'),
                decision.get('runtime'),
                decision.get('capability'),
                decision.get('model_name', 'smart_civic_ai'),
                decision.get('model_version', '1.0.0'),
                json.dumps(decision.get('input_summary', {})),
                json.dumps(decision.get('details', {})),
                decision.get('confidence', 0.9),
                decision.get('decision', ''),  # maps to 'reason' column
                decision.get('action', decision.get('decision', '')),
                decision.get('processing_time_ms', 0)
            ))
            conn.commit()
            row = cur.fetchone()
            return str(row['id']) if row else None

def insert_audit_event(event: dict) -> str:
    """Insert into audit_events matching schema columns exactly."""
    with get_sync_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO audit_events 
                    (actor_type, actor_id, action, object_type, object_id, details)
                VALUES (%s, %s, %s, %s, %s, %s) 
                RETURNING id
            """, (
                event.get('actor_type', 'system'),
                event.get('actor_id', 'ai_worker'),
                event.get('event_type', event.get('action', 'UNKNOWN')),
                event.get('object_type', 'case'),
                event.get('case_id', event.get('object_id', '')),
                json.dumps({
                    'description': event.get('description', ''),
                    **event.get('metadata', {})
                })
            ))
            conn.commit()
            row = cur.fetchone()
            return str(row['id']) if row else None

def insert_volumetric_estimate(estimate: dict) -> str:
    """Insert into volumetric_estimates matching schema columns exactly."""
    with get_sync_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO volumetric_estimates 
                    (case_id, evidence_id, depth_model, model_version,
                     estimated_volume_m3, estimated_area_m2, estimated_depth_m,
                     estimated_tonnage_kg, material_type, dispatch_guidance,
                     confidence, processing_time_ms)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) 
                RETURNING id
            """, (
                estimate.get('case_id'),
                estimate.get('evidence_id'),
                estimate.get('depth_model', 'depth_anything_v2_small'),
                estimate.get('model_version', '1.0.0'),
                estimate.get('volume_m3'),
                estimate.get('area_m2'),
                estimate.get('avg_depth_m'),
                estimate.get('tonnage_kg'),
                estimate.get('material_type', 'cold_mix_asphalt'),
                estimate.get('metadata', {}).get('guidance', ''),
                estimate.get('confidence', 0.75),
                estimate.get('processing_time_ms', 0)
            ))
            conn.commit()
            row = cur.fetchone()
            return str(row['id']) if row else None

def fetch_evidence(evidence_id: str) -> dict:
    with get_sync_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM evidence WHERE id = %s", (evidence_id,))
            return cur.fetchone()

def update_verification(verification_id: str, updates: dict) -> None:
    """Update verifications table with schema-aligned columns."""
    if not updates:
        return
    # Map incoming keys to actual schema columns
    column_map = {
        'status': 'ai_result',
        'ssim_score': 'ssim_score',
        'hash_value': 'ai_match_score',
        'exif_metadata': 'exif_consistent',
    }
    mapped = {}
    for k, v in updates.items():
        col = column_map.get(k, k)
        mapped[col] = v
    
    set_clause = ', '.join([f"{k} = %s" for k in mapped.keys()])
    values = list(mapped.values()) + [verification_id]
    with get_sync_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"UPDATE verifications SET {set_clause} WHERE id = %s", values)
        conn.commit()

def find_spatial_duplicates(lon: float, lat: float, category: str, hours: int = 72, radius_m: int = 15) -> list:
    """Find spatial duplicates using locations table JOIN (matching actual schema)."""
    with get_sync_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT c.id, c.case_number, c.category, c.status, 
                       c.master_case_id, c.community_impact_score,
                       ST_Distance(
                           l.coordinates::geography, 
                           ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography
                       ) as distance_m
                FROM cases c
                JOIN locations l ON l.case_id = c.id
                WHERE c.category = %s
                  AND c.reported_at >= NOW() - make_interval(hours => %s)
                  AND c.status NOT IN ('verified_closed', 'reopened')
                  AND ST_DWithin(
                      l.coordinates::geography,
                      ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                      %s
                  )
                ORDER BY distance_m ASC
            """, (lon, lat, category, hours, lon, lat, radius_m))
            return cur.fetchall()

def link_master_case(case_id: str, master_id: str) -> None:
    with get_sync_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE cases SET master_case_id = %s, updated_at = NOW() WHERE id = %s",
                (master_id, case_id)
            )
            cur.execute(
                "UPDATE cases SET community_impact_score = COALESCE(community_impact_score, 0) + 1, updated_at = NOW() WHERE id = %s",
                (master_id,)
            )
        conn.commit()
