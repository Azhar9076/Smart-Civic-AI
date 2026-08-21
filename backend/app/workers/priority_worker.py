import json
from datetime import datetime
from celery_app import app as celery_app
from app.workers.db_utils import fetch_case, update_case, insert_agent_decision

@celery_app.task(name='calculate_priority', queue='priority', bind=True, max_retries=3)
def calculate_priority(self, case_id: str):
    try:
        case = fetch_case(case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        severity = case.get('severity') or 3
        category = case.get('category', 'General')
        
        # Calculate safety risk
        safety_risk = 2
        if category == 'Pothole':
            safety_risk = 4  # Assuming main road for this logic; could be dynamic
        elif category == 'Water Leak':
            safety_risk = 3
        elif category == 'Street Light':
            safety_risk = 4
        
        # Calculate location risk (assuming 3 for demo)
        location_risk = 3
        
        # Get upvotes
        upvotes = case.get('community_impact_score', 0)
        
        # Calculate age hours
        reported_at = case.get('reported_at', datetime.now())
        age_hours = (datetime.now() - reported_at).total_seconds() / 3600
        if age_hours < 0: age_hours = 0
        
        # Priority Formula
        s_part = (severity / 5) * 100 * 0.35
        sr_part = (safety_risk / 5) * 100 * 0.25
        lr_part = (location_risk / 5) * 100 * 0.20
        u_part = min(upvotes / 10, 1) * 100 * 0.10
        a_part = min(age_hours / 168, 1) * 100 * 0.10
        
        priority_score = s_part + sr_part + lr_part + u_part + a_part
        
        if priority_score < 25:
            priority_label = 'LOW'
        elif priority_score < 50:
            priority_label = 'MEDIUM'
        elif priority_score < 75:
            priority_label = 'HIGH'
        else:
            priority_label = 'CRITICAL'
            
        reason = f"Priority {priority_score:.1f}: {priority_label} due to Severity {severity}, Safety Risk {safety_risk}, Upvotes {upvotes}."
        
        # SLA
        if priority_score >= 75:
            sla_hours = 24
        elif priority_score >= 50:
            sla_hours = 48
        else:
            sla_hours = 72
            
        update_case(case_id, {
            'priority_score': priority_score,
            'priority_label': priority_label,
            'priority_breakdown': json.dumps({
                'severity': s_part,
                'safety_risk': sr_part,
                'location_risk': lr_part,
                'upvotes': u_part,
                'age': a_part
            }),
            'assigned_department': f"Dept_{category.replace(' ', '')}"
        })
        
        insert_agent_decision({
            "case_id": case_id,
            "runtime": "priority",
            "capability": "priority_engine",
            "decision": f"Assigned priority {priority_label} with SLA {sla_hours}h",
            "details": {"score": priority_score, "reason": reason}
        })
        
        return {"status": "success", "priority": priority_score}
    except Exception as exc:
        self.retry(exc=exc, countdown=2 ** self.request.retries)
