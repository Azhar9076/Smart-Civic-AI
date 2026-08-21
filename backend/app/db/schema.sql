CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    zone VARCHAR(100),
    boundary GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
    department VARCHAR(255),
    contact_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wards_boundary ON wards USING GIST(boundary);

CREATE TABLE cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_number VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    description TEXT,
    severity INT CHECK(severity >= 1 AND severity <= 5),
    priority_score NUMERIC(5,2) CHECK(priority_score >= 0 AND priority_score <= 100),
    priority_label VARCHAR(20),
    priority_breakdown JSONB,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted','processing','localized','prioritized','assigned','in_progress','resolved','verification_pending','verified_closed','reopened','human_review')),
    master_case_id UUID REFERENCES cases(id),
    community_impact_score INT DEFAULT 1,
    citizen_id UUID,
    ward_id INT REFERENCES wards(id),
    location_id UUID,
    assigned_department VARCHAR(255),
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    sla_due_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_ward_id ON cases(ward_id);
CREATE INDEX idx_cases_master_case_id ON cases(master_case_id);
CREATE INDEX idx_cases_reported_at ON cases(reported_at);
CREATE INDEX idx_cases_priority_score ON cases(priority_score DESC);

CREATE TABLE locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    coordinates GEOMETRY(POINT, 4326) NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    address TEXT,
    ward_id INT REFERENCES wards(id),
    zone VARCHAR(100),
    accuracy_meters NUMERIC(8,2),
    source VARCHAR(50) CHECK (source IN ('gps','manual','network')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_locations_coordinates ON locations USING GIST(coordinates);

CREATE TABLE evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    type VARCHAR(50) CHECK (type IN ('photo','video','audio','document')),
    file_path TEXT NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    capture_timestamp TIMESTAMPTZ,
    capture_location GEOMETRY(POINT, 4326),
    exif_metadata JSONB,
    tamper_check_result VARCHAR(50) CHECK (tamper_check_result IN ('passed','failed','suspicious','pending')),
    tamper_check_details JSONB,
    is_before BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_evidence_case_id ON evidence(case_id);
CREATE INDEX idx_evidence_hash ON evidence(file_hash_sha256);

CREATE TABLE assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    work_order_number VARCHAR(30) UNIQUE,
    department VARCHAR(255),
    team_id VARCHAR(100),
    officer_id UUID,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    due_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','accepted','in_progress','completed','rejected')),
    notes TEXT
);
CREATE INDEX idx_assignments_case_id ON assignments(case_id);
CREATE INDEX idx_assignments_status ON assignments(status);

CREATE TABLE verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    before_evidence_id UUID REFERENCES evidence(id),
    after_evidence_id UUID REFERENCES evidence(id),
    ai_match_score NUMERIC(5,4),
    ai_result VARCHAR(50) CHECK (ai_result IN ('verified','suspicious','rejected','pending')),
    ssim_score NUMERIC(5,4),
    gps_match BOOLEAN,
    timestamp_valid BOOLEAN,
    exif_consistent BOOLEAN,
    reviewer_id UUID,
    reviewer_result VARCHAR(50),
    citizen_response VARCHAR(50) CHECK (citizen_response IN ('accepted','rejected','pending')),
    citizen_feedback TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_verifications_case_id ON verifications(case_id);

CREATE TABLE agent_decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    runtime VARCHAR(50) CHECK (runtime IN ('intake','priority','depth','verification')),
    capability VARCHAR(100),
    model_name VARCHAR(100),
    model_version VARCHAR(50),
    input_summary JSONB,
    output_summary JSONB,
    confidence NUMERIC(5,4),
    reason TEXT,
    action_taken VARCHAR(255),
    processing_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_agent_decisions_case_id ON agent_decisions(case_id);
CREATE INDEX idx_agent_decisions_runtime ON agent_decisions(runtime);

CREATE TABLE audit_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_type VARCHAR(50),
    actor_id VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    object_type VARCHAR(100),
    object_id VARCHAR(255),
    details JSONB,
    hash_reference VARCHAR(64),
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_events_object ON audit_events(object_type, object_id);
CREATE INDEX idx_audit_events_actor ON audit_events(actor_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);

CREATE TABLE volumetric_estimates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID REFERENCES cases(id),
    evidence_id UUID REFERENCES evidence(id),
    depth_model VARCHAR(100) DEFAULT 'depth_anything_v2_small',
    model_version VARCHAR(50),
    estimated_volume_m3 NUMERIC(10,4),
    estimated_area_m2 NUMERIC(10,4),
    estimated_depth_m NUMERIC(6,4),
    estimated_tonnage_kg NUMERIC(10,2),
    material_type VARCHAR(100) DEFAULT 'cold_mix_asphalt',
    dispatch_guidance TEXT,
    confidence NUMERIC(5,4),
    processing_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_volumetric_estimates_case_id ON volumetric_estimates(case_id);

CREATE TABLE offline_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    local_id VARCHAR(255) NOT NULL,
    citizen_id UUID,
    payload_hash VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    sync_status VARCHAR(50) DEFAULT 'pending' CHECK (sync_status IN ('pending','syncing','synced','failed','duplicate')),
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 5,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);
CREATE INDEX idx_offline_queue_status ON offline_queue(sync_status);
CREATE INDEX idx_offline_queue_hash ON offline_queue(payload_hash);
