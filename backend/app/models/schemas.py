from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class CaseIntakeRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    latitude: float
    longitude: float
    category: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[int] = Field(None, ge=1, le=5)
    citizen_id: Optional[UUID] = None
    media_files: Optional[List[str]] = None
    voice_recording_url: Optional[str] = None
    language: str = 'en'
    offline_local_id: Optional[str] = None

class CaseIntakeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    case_id: UUID
    case_number: str
    status: str = 'submitted'
    message: str
    received_at: datetime

class CaseSearchRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status: Optional[str] = None
    category: Optional[str] = None
    ward_id: Optional[int] = None
    priority_min: Optional[float] = None
    priority_max: Optional[float] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = 1
    page_size: int = 20

class TimelineEvent(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    stage: str
    timestamp: datetime
    details: str
    runtime: Optional[str] = None

class CaseDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    case_id: UUID
    case_number: str
    category: str
    subcategory: Optional[str] = None
    description: Optional[str] = None
    severity: int
    priority_score: float
    priority_label: str
    priority_breakdown: Dict[str, Any]
    status: str
    community_impact_score: int
    ward_name: Optional[str] = None
    ward_code: Optional[str] = None
    department: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    reported_at: datetime
    sla_due_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    evidence: List[Dict[str, Any]]
    timeline: List[TimelineEvent]
    agent_decisions: List[Dict[str, Any]]
    volumetric_estimate: Optional[Dict[str, Any]] = None

class GISLookupRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    latitude: float
    longitude: float

class GISLookupResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    ward_id: Optional[int] = None
    ward_name: Optional[str] = None
    ward_code: Optional[str] = None
    zone: Optional[str] = None
    department: Optional[str] = None
    confidence: str = 'exact_match'

class VerificationRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    case_id: UUID
    after_evidence_hash: str
    after_evidence_path: str
    worker_id: UUID
    worker_lat: float
    worker_lon: float
    capture_timestamp: datetime

class VerificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    verification_id: UUID
    case_id: UUID
    ai_result: str
    ssim_score: Optional[float] = None
    gps_match: bool
    status: str

class WardInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    code: str
    zone: str
    department: str

class PriorityBreakdown(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    severity_score: float
    safety_risk_score: float
    location_risk_score: float
    upvotes_score: float
    age_score: float
    total_score: float
    label: str
    reason: str

class CaseSearchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    cases: List[CaseDetail]
    total: int
    page: int
    page_size: int
    total_pages: int
