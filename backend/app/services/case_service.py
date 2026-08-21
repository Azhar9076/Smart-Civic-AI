import uuid
import random
from datetime import datetime, timezone
from typing import Optional
from app.models.schemas import (
    CaseIntakeRequest, CaseIntakeResponse, CaseDetail,
    CaseSearchRequest, CaseSearchResult, TimelineEvent
)


async def create_case(pool, request: CaseIntakeRequest) -> CaseIntakeResponse:
    """Fast path case creation: write to PG and return immediately (<200ms).
    
    No LLM inference, no voice transcription, no depth ML here.
    All heavy processing is offloaded to Celery workers.
    """
    case_id = uuid.uuid4()
    date_str = datetime.now().strftime("%Y%m%d")
    random_str = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=4))
    case_number = f"SCA-{date_str}-{random_str}"
    received_at = datetime.now(timezone.utc)

    insert_case_query = """
        INSERT INTO cases (id, case_number, status, category, description, severity, citizen_id, reported_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    """
    insert_location_query = """
        INSERT INTO locations (case_id, coordinates, latitude, longitude, source)
        VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $3, 'gps')
    """

    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                insert_case_query,
                case_id,
                case_number,
                "submitted",
                request.category,
                request.description,
                request.severity,
                request.citizen_id,
                received_at
            )
            await conn.execute(
                insert_location_query,
                case_id,
                request.longitude,
                request.latitude,
                request.latitude
            )

    return CaseIntakeResponse(
        case_id=case_id,
        case_number=case_number,
        status="submitted",
        message="Case submitted successfully. AI processing initiated.",
        received_at=received_at
    )


async def get_case_detail(pool, case_id: uuid.UUID) -> CaseDetail:
    """Full case detail with all JOINs for timeline, evidence, and agent decisions."""
    query = """
        SELECT c.*,
               ST_X(l.coordinates::geometry) as longitude,
               ST_Y(l.coordinates::geometry) as latitude,
               l.address,
               w.name as ward_name, w.code as ward_code, w.department as department
        FROM cases c
        LEFT JOIN locations l ON l.case_id = c.id
        LEFT JOIN wards w ON c.ward_id = w.id
        WHERE c.id = $1
    """
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, case_id)
        if not row:
            raise ValueError("Case not found")

        # Fetch related evidence
        evidence_rows = await conn.fetch(
            "SELECT id, type, file_path, capture_timestamp, tamper_check_result, is_before FROM evidence WHERE case_id = $1 ORDER BY created_at",
            case_id
        )

        # Fetch agent decisions for timeline
        decisions_rows = await conn.fetch(
            "SELECT runtime, capability, confidence, reason, action_taken, processing_time_ms, created_at FROM agent_decisions WHERE case_id = $1 ORDER BY created_at",
            case_id
        )

        # Fetch volumetric estimate
        vol_row = await conn.fetchrow(
            "SELECT estimated_volume_m3, estimated_area_m2, estimated_depth_m, estimated_tonnage_kg, material_type, dispatch_guidance, confidence FROM volumetric_estimates WHERE case_id = $1 ORDER BY created_at DESC LIMIT 1",
            case_id
        )

        # Build timeline from status progression + agent decisions
        timeline = _build_timeline(row, decisions_rows)

        return CaseDetail(
            case_id=row['id'],
            case_number=row['case_number'],
            category=row['category'] or 'unknown',
            subcategory=row.get('subcategory'),
            description=row['description'],
            severity=row['severity'] or 1,
            priority_score=float(row['priority_score']) if row.get('priority_score') else 0.0,
            priority_label=row.get('priority_label') or 'PENDING',
            priority_breakdown=row.get('priority_breakdown') or {},
            status=row['status'],
            community_impact_score=row.get('community_impact_score') or 1,
            ward_name=row.get('ward_name'),
            ward_code=row.get('ward_code'),
            department=row.get('department'),
            latitude=float(row['latitude']) if row.get('latitude') else 0.0,
            longitude=float(row['longitude']) if row.get('longitude') else 0.0,
            address=row.get('address'),
            reported_at=row['reported_at'],
            sla_due_at=row.get('sla_due_at'),
            resolved_at=row.get('resolved_at'),
            evidence=[dict(e) for e in evidence_rows],
            timeline=timeline,
            agent_decisions=[dict(d) for d in decisions_rows],
            volumetric_estimate=dict(vol_row) if vol_row else None
        )


def _build_timeline(case_row, decisions) -> list:
    """Build case timeline from status and agent decisions."""
    stages = [
        ('Report Submitted', 'submitted'),
        ('AI Understanding', 'processing'),
        ('Location Confirmed', 'localized'),
        ('Priority Calculated', 'prioritized'),
        ('Department Assigned', 'assigned'),
        ('Work In Progress', 'in_progress'),
        ('Resolution Evidence', 'resolved'),
        ('Citizen Verification', 'verification_pending'),
    ]

    status_order = {s[1]: i for i, s in enumerate(stages)}
    current_idx = status_order.get(case_row['status'], 0)

    timeline = []
    for i, (label, status_key) in enumerate(stages):
        runtime = None
        details = label
        timestamp = case_row.get('reported_at')

        # Match agent decisions to timeline stages
        for d in decisions:
            if d['runtime'] == 'intake' and status_key == 'processing':
                details = d.get('reason', label)
                runtime = 'intake'
                timestamp = d['created_at']
            elif d['runtime'] == 'priority' and status_key == 'prioritized':
                details = d.get('reason', label)
                runtime = 'priority'
                timestamp = d['created_at']

        if i <= current_idx:
            timeline.append({
                'stage': label,
                'timestamp': str(timestamp),
                'details': details,
                'runtime': runtime
            })

    return timeline


async def search_cases(pool, params: CaseSearchRequest) -> CaseSearchResult:
    """Dynamic query builder with pagination and filtering."""
    conditions = []
    args = []
    idx = 1

    if params.status:
        conditions.append(f"c.status = ${idx}")
        args.append(params.status)
        idx += 1

    if params.category:
        conditions.append(f"c.category = ${idx}")
        args.append(params.category)
        idx += 1

    if params.ward_id:
        conditions.append(f"c.ward_id = ${idx}")
        args.append(params.ward_id)
        idx += 1

    if params.priority_min is not None:
        conditions.append(f"c.priority_score >= ${idx}")
        args.append(params.priority_min)
        idx += 1

    if params.priority_max is not None:
        conditions.append(f"c.priority_score <= ${idx}")
        args.append(params.priority_max)
        idx += 1

    if params.date_from:
        conditions.append(f"c.reported_at >= ${idx}")
        args.append(params.date_from)
        idx += 1

    if params.date_to:
        conditions.append(f"c.reported_at <= ${idx}")
        args.append(params.date_to)
        idx += 1

    where_clause = " AND ".join(conditions) if conditions else "TRUE"

    async with pool.acquire() as conn:
        # Count total
        count_query = f"SELECT COUNT(*) FROM cases c WHERE {where_clause}"
        total = await conn.fetchval(count_query, *args)

        # Fetch paginated results with location + ward join
        fetch_query = f"""
            SELECT c.id as case_id, c.case_number, c.category, c.subcategory,
                   c.description, c.severity, c.priority_score, c.priority_label,
                   c.priority_breakdown, c.status, c.community_impact_score,
                   c.assigned_department as department, c.reported_at, c.sla_due_at,
                   c.resolved_at,
                   ST_Y(l.coordinates::geometry) as latitude,
                   ST_X(l.coordinates::geometry) as longitude,
                   l.address,
                   w.name as ward_name, w.code as ward_code
            FROM cases c
            LEFT JOIN locations l ON l.case_id = c.id
            LEFT JOIN wards w ON c.ward_id = w.id
            WHERE {where_clause}
            ORDER BY c.priority_score DESC NULLS LAST, c.reported_at DESC
            LIMIT ${idx} OFFSET ${idx + 1}
        """
        fetch_args = args + [params.page_size, (params.page - 1) * params.page_size]
        rows = await conn.fetch(fetch_query, *fetch_args)

        cases = []
        for row in rows:
            cases.append(CaseDetail(
                case_id=row['case_id'],
                case_number=row['case_number'],
                category=row['category'] or 'unknown',
                subcategory=row.get('subcategory'),
                description=row.get('description'),
                severity=row.get('severity') or 1,
                priority_score=float(row['priority_score']) if row.get('priority_score') else 0.0,
                priority_label=row.get('priority_label') or 'PENDING',
                priority_breakdown=row.get('priority_breakdown') or {},
                status=row['status'],
                community_impact_score=row.get('community_impact_score') or 1,
                ward_name=row.get('ward_name'),
                ward_code=row.get('ward_code'),
                department=row.get('department'),
                latitude=float(row['latitude']) if row.get('latitude') else 0.0,
                longitude=float(row['longitude']) if row.get('longitude') else 0.0,
                address=row.get('address'),
                reported_at=row['reported_at'],
                sla_due_at=row.get('sla_due_at'),
                resolved_at=row.get('resolved_at'),
                evidence=[],
                timeline=[],
                agent_decisions=[],
                volumetric_estimate=None
            ))

        total_pages = (total + params.page_size - 1) // params.page_size if total else 0

        return CaseSearchResult(
            cases=cases,
            total=total,
            page=params.page,
            page_size=params.page_size,
            total_pages=total_pages
        )


async def get_case_stats(pool) -> dict:
    """Aggregate stats for admin dashboard overview."""
    async with pool.acquire() as conn:
        # Status counts
        status_rows = await conn.fetch(
            "SELECT status, COUNT(*) as count FROM cases GROUP BY status"
        )
        by_status = {r['status']: r['count'] for r in status_rows}

        # Category counts
        cat_rows = await conn.fetch(
            "SELECT category, COUNT(*) as count FROM cases WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC"
        )
        by_category = {r['category']: r['count'] for r in cat_rows}

        # Priority distribution
        priority_rows = await conn.fetch(
            "SELECT priority_label, COUNT(*) as count FROM cases WHERE priority_label IS NOT NULL GROUP BY priority_label"
        )
        by_priority = {r['priority_label']: r['count'] for r in priority_rows}

        # SLA at risk (< 25% time remaining)
        sla_at_risk = await conn.fetchval("""
            SELECT COUNT(*) FROM cases
            WHERE sla_due_at IS NOT NULL
              AND status NOT IN ('verified_closed', 'reopened')
              AND sla_due_at - NOW() < (sla_due_at - reported_at) * 0.25
        """)

        # Total cases
        total = await conn.fetchval("SELECT COUNT(*) FROM cases")

        return {
            'total_cases': total,
            'by_status': by_status,
            'by_category': by_category,
            'by_priority': by_priority,
            'sla_at_risk': sla_at_risk or 0,
            'active_cases': by_status.get('assigned', 0) + by_status.get('in_progress', 0),
            'resolved_today': await conn.fetchval(
                "SELECT COUNT(*) FROM cases WHERE status = 'verified_closed' AND closed_at >= CURRENT_DATE"
            ) or 0
        }
