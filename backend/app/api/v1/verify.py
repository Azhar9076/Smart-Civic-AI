from fastapi import APIRouter, Request
from app.models.schemas import VerificationRequest, VerificationResponse
import uuid
from datetime import datetime

router = APIRouter(prefix="/cases", tags=["verification"])

@router.post("/verify", response_model=VerificationResponse)
async def verify_case(request: Request, verify_req: VerificationRequest):
    pool = request.app.state.pool
    verification_id = uuid.uuid4()
    
    query = """
        INSERT INTO verifications (id, case_id, after_evidence_hash, after_evidence_path, worker_id, worker_lat, worker_lon, capture_timestamp, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    """
    
    async with pool.acquire() as conn:
        await conn.execute(
            query,
            verification_id,
            verify_req.case_id,
            verify_req.after_evidence_hash,
            verify_req.after_evidence_path,
            verify_req.worker_id,
            verify_req.worker_lat,
            verify_req.worker_lon,
            verify_req.capture_timestamp,
            "pending"
        )
        
    # Celery task dispatch would go here: process_verification.delay(verification_id)
    
    return VerificationResponse(
        verification_id=verification_id,
        case_id=verify_req.case_id,
        ai_result="pending",
        gps_match=True,  # simplified logic for now
        status="pending"
    )

@router.get("/{case_id}/verification")
async def get_verification(request: Request, case_id: uuid.UUID):
    pool = request.app.state.pool
    query = "SELECT * FROM verifications WHERE case_id = $1 ORDER BY capture_timestamp DESC LIMIT 1"
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, case_id)
        if row:
            return dict(row)
        return {"status": "no_verification_found"}
