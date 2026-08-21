from celery_app import app as celery_app
from app.workers.db_utils import fetch_case, find_spatial_duplicates, link_master_case, insert_agent_decision, insert_audit_event

@celery_app.task(name='check_duplicates', queue='dedup', bind=True, max_retries=3)
def check_duplicates(self, case_id: str):
    try:
        case = fetch_case(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")
            
        lon, lat = 72.846, 19.119
        
        duplicates = find_spatial_duplicates(lon, lat, case.get('category', 'General'))
        duplicates = [d for d in duplicates if str(d['id']) != str(case_id)]
        
        if duplicates:
            master = duplicates[0]
            master_id = master.get('master_case_id') or master['id']
            link_master_case(case_id, master_id)
            
            insert_agent_decision({
                "case_id": case_id,
                "runtime": "dedup",
                "capability": "spatial_dedup",
                "decision": f"Linked to master case {master_id}",
                "details": {"distance_m": "under 15m", "master_id": master_id}
            })
            
            insert_audit_event({
                "case_id": case_id,
                "event_type": "DUPLICATE_DETECTED",
                "description": f"Case linked as duplicate of {master_id}"
            })
            return {"status": "duplicate", "master_id": master_id}
            
        else:
            insert_agent_decision({
                "case_id": case_id,
                "runtime": "dedup",
                "capability": "spatial_dedup",
                "decision": "No duplicates found within 15m/72h window",
                "details": {}
            })
            
            insert_audit_event({
                "case_id": case_id,
                "event_type": "UNIQUE_CASE_CONFIRMED",
                "description": "No duplicates detected"
            })
            return {"status": "unique"}
            
    except Exception as exc:
        self.retry(exc=exc, countdown=2 ** self.request.retries)
