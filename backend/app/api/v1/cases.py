from fastapi import APIRouter, Depends, HTTPException, Request
from app.models.schemas import (
    CaseIntakeRequest, CaseIntakeResponse, CaseSearchRequest,
    CaseSearchResult, CaseDetail
)
from app.services.case_service import (
    create_case, get_case_detail, search_cases, get_case_stats
)
import uuid

router = APIRouter(prefix="/cases", tags=["cases"])


@router.post("/intake", response_model=CaseIntakeResponse)
async def intake_case(request: Request, case_request: CaseIntakeRequest):
    """Fast intake path: <200ms acknowledgement.
    
    1. Validate payload
    2. Write raw metadata to PostgreSQL
    3. Enqueue background processing to Celery via Redis
    4. Return 200 OK with case_uuid immediately
    """
    pool = request.app.state.pool
    response = await create_case(pool, case_request)

    # Offload agent orchestration to background Celery worker
    try:
        from celery_app import app as celery_app
        celery_app.send_task(
            'process_new_case',
            args=[str(response.case_id)],
            queue='intake'
        )
    except Exception:
        # If Celery is unavailable, case is still persisted — will be picked up by retry sweep
        pass

    return response


@router.get("/search", response_model=CaseSearchResult)
async def api_search_cases(request: Request, params: CaseSearchRequest = Depends()):
    pool = request.app.state.pool
    result = await search_cases(pool, params)
    return result


@router.get("/stats")
async def get_stats(request: Request):
    """Dashboard stats: counts by status, category, priority, ward."""
    pool = request.app.state.pool
    stats = await get_case_stats(pool)
    return stats


@router.get("/{case_id}", response_model=CaseDetail)
async def get_case(request: Request, case_id: uuid.UUID):
    pool = request.app.state.pool
    try:
        case_detail = await get_case_detail(pool, case_id)
        return case_detail
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
