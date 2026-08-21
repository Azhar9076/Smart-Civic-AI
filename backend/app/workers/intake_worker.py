import json
from celery_app import app as celery_app
from app.workers.db_utils import fetch_case, update_case, insert_agent_decision

def simulate_voice_parse(audio_url, language):
    return {
        "transcript": "There is a massive road defect near Pune Municipal Corporation Hadapsar sector, extremely hazardous for two-wheelers.",
        "language": language or "en",
        "confidence": 0.95
    }

def simulate_vision_classify(image_path):
    return {
        "category": "Pothole",
        "subcategory": "Deep",
        "confidence": 0.88
    }

def extract_structured_data(text, language):
    return {
        "category": "Pothole",
        "severity": 4,
        "ward_hint": "PMC Ward-15 - Hadapsar/Handewadi",
        "city": "Pune",
        "entities": ["pothole", "hazardous", "Hadapsar", "Pune"]
    }

@celery_app.task(name='process_intake', queue='intake', bind=True, max_retries=3)
def process_intake(self, case_id: str, payload: dict):
    try:
        case_data = fetch_case(case_id)
        if not case_data:
            raise ValueError(f"Case {case_id} not found")

        audio_url = payload.get("audio_url")
        image_path = payload.get("image_path")
        
        voice_data = {}
        if audio_url:
            voice_data = simulate_voice_parse(audio_url, payload.get("language"))
        
        vision_data = {}
        if image_path:
            vision_data = simulate_vision_classify(image_path)
        
        text_to_process = voice_data.get("transcript", payload.get("description", ""))
        nlp_data = extract_structured_data(text_to_process, voice_data.get("language", "en"))
        
        final_category = vision_data.get("category", nlp_data.get("category", "General"))
        final_severity = nlp_data.get("severity", 3)
        
        updates = {
            "category": final_category,
            "severity": final_severity,
            "description": text_to_process,
            "nlp_entities": json.dumps(nlp_data.get("entities", []))
        }
        
        update_case(case_id, updates)
        
        insert_agent_decision({
            "case_id": case_id,
            "runtime": "intake",
            "capability": "voice_parse/vision_classify/nlp_extract",
            "decision": f"Enriched case data for PMC Zone: {nlp_data.get('ward_hint', 'PMC Ward-15 - Hadapsar/Handewadi')}",
            "details": {"voice": voice_data, "vision": vision_data, "nlp": nlp_data}
        })
        
        # Chain to next tasks
        celery_app.send_task('calculate_priority', args=[case_id], queue='priority')
        celery_app.send_task('check_duplicates', args=[case_id], queue='dedup')
        
        return {"status": "success", "case_id": case_id}
    except Exception as exc:
        self.retry(exc=exc, countdown=2 ** self.request.retries)
