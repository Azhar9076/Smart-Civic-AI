from app.models.schemas import PriorityBreakdown

def calculate_priority(severity: int, safety_risk: int, location_risk: int, upvotes: int, age_hours: float) -> PriorityBreakdown:
    severity_score = (severity / 5) * 100 * 0.35
    safety_risk_score = (safety_risk / 5) * 100 * 0.25
    location_risk_score = (location_risk / 5) * 100 * 0.20
    upvotes_score = min(upvotes / 10, 1.0) * 100 * 0.10
    age_score = min(age_hours / 168, 1.0) * 100 * 0.10
    
    total_score = severity_score + safety_risk_score + location_risk_score + upvotes_score + age_score
    
    if total_score < 25:
        label = "LOW"
    elif total_score < 50:
        label = "MEDIUM"
    elif total_score < 75:
        label = "HIGH"
    else:
        label = "CRITICAL"
        
    reason = f"Priority is {label} due to severity ({severity}), safety risk ({safety_risk}), and location risk ({location_risk})."
    
    return PriorityBreakdown(
        severity_score=severity_score,
        safety_risk_score=safety_risk_score,
        location_risk_score=location_risk_score,
        upvotes_score=upvotes_score,
        age_score=age_score,
        total_score=total_score,
        label=label,
        reason=reason
    )
