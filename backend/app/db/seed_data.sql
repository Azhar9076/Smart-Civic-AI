-- =============================================================
-- Smart Civic AI — Seed Data for SIH Demo Scenario
-- =============================================================

-- Ward Boundaries (Mumbai demo wards)
INSERT INTO wards (name, code, zone, boundary, department, contact_info) VALUES
(
    'Andheri',
    'WARD-A',
    'Western Suburbs',
    ST_GeomFromText('MULTIPOLYGON(((72.830 19.110, 72.860 19.110, 72.860 19.130, 72.830 19.130, 72.830 19.110)))', 4326),
    'Roads & Infrastructure - West',
    '{"phone": "+91-22-2600-1001", "email": "ward.a@mcgm.gov.in"}'::jsonb
),
(
    'Bandra',
    'WARD-B',
    'Western Suburbs',
    ST_GeomFromText('MULTIPOLYGON(((72.825 19.045, 72.855 19.045, 72.855 19.065, 72.825 19.065, 72.825 19.045)))', 4326),
    'Water Supply & Drainage - West',
    '{"phone": "+91-22-2600-1002", "email": "ward.b@mcgm.gov.in"}'::jsonb
),
(
    'Dadar',
    'WARD-C',
    'City',
    ST_GeomFromText('MULTIPOLYGON(((72.835 19.010, 72.855 19.010, 72.855 19.025, 72.835 19.025, 72.835 19.010)))', 4326),
    'Solid Waste Management - Central',
    '{"phone": "+91-22-2600-1003", "email": "ward.c@mcgm.gov.in"}'::jsonb
);

-- =====================
-- Case 1: Critical Pothole in Andheri (master case)
-- =====================
INSERT INTO cases (id, case_number, category, subcategory, description, severity, priority_score, priority_label,
    priority_breakdown, status, community_impact_score, ward_id, assigned_department, reported_at, sla_due_at)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'SCA-20260820-A1B2',
    'Pothole', 'Deep',
    'Large pothole on Andheri Link Road near metro station causing traffic hazard',
    5, 92.50, 'CRITICAL',
    '{"severity": 35.0, "safety_risk": 20.0, "location_risk": 16.0, "upvotes": 10.0, "age": 5.0}'::jsonb,
    'assigned', 3,
    (SELECT id FROM wards WHERE code = 'WARD-A'),
    'Roads & Infrastructure - West',
    NOW() - INTERVAL '6 hours',
    NOW() + INTERVAL '18 hours'
);

INSERT INTO locations (case_id, coordinates, latitude, longitude, address, ward_id, source)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    ST_SetSRID(ST_MakePoint(72.846, 19.119), 4326),
    19.119, 72.846,
    'Andheri Link Road, near Metro Station, Mumbai 400053',
    (SELECT id FROM wards WHERE code = 'WARD-A'),
    'gps'
);

-- =====================
-- Case 2: Water Leak in Bandra
-- =====================
INSERT INTO cases (id, case_number, category, subcategory, description, severity, priority_score, priority_label,
    priority_breakdown, status, community_impact_score, ward_id, assigned_department, reported_at, sla_due_at)
VALUES (
    'a1000000-0000-0000-0000-000000000002',
    'SCA-20260820-C3D4',
    'Water Leak', 'Pipeline',
    'Water pipeline leaking at Bandra Kurla Complex junction, water wasting continuously',
    3, 55.00, 'HIGH',
    '{"severity": 21.0, "safety_risk": 15.0, "location_risk": 12.0, "upvotes": 2.0, "age": 3.0}'::jsonb,
    'in_progress', 1,
    (SELECT id FROM wards WHERE code = 'WARD-B'),
    'Water Supply & Drainage - West',
    NOW() - INTERVAL '10 hours',
    NOW() + INTERVAL '38 hours'
);

INSERT INTO locations (case_id, coordinates, latitude, longitude, address, ward_id, source)
VALUES (
    'a1000000-0000-0000-0000-000000000002',
    ST_SetSRID(ST_MakePoint(72.840, 19.054), 4326),
    19.054, 72.840,
    'BKC Junction, Bandra East, Mumbai 400051',
    (SELECT id FROM wards WHERE code = 'WARD-B'),
    'gps'
);

-- =====================
-- Case 3: Garbage in Dadar
-- =====================
INSERT INTO cases (id, case_number, category, subcategory, description, severity, priority_score, priority_label,
    priority_breakdown, status, community_impact_score, ward_id, assigned_department, reported_at, sla_due_at)
VALUES (
    'a1000000-0000-0000-0000-000000000003',
    'SCA-20260819-E5F6',
    'Garbage', 'Open Dump',
    'Open garbage dump near Dadar station west overflowing onto footpath',
    2, 30.00, 'MEDIUM',
    '{"severity": 14.0, "safety_risk": 5.0, "location_risk": 8.0, "upvotes": 1.0, "age": 2.0}'::jsonb,
    'submitted', 1,
    (SELECT id FROM wards WHERE code = 'WARD-C'),
    'Solid Waste Management - Central',
    NOW() - INTERVAL '26 hours',
    NOW() + INTERVAL '46 hours'
);

INSERT INTO locations (case_id, coordinates, latitude, longitude, address, ward_id, source)
VALUES (
    'a1000000-0000-0000-0000-000000000003',
    ST_SetSRID(ST_MakePoint(72.844, 19.018), 4326),
    19.018, 72.844,
    'Dadar Station West, Mumbai 400028',
    (SELECT id FROM wards WHERE code = 'WARD-C'),
    'gps'
);

-- =====================
-- Case 4: Street Light Outage in Andheri
-- =====================
INSERT INTO cases (id, case_number, category, subcategory, description, severity, priority_score, priority_label,
    priority_breakdown, status, community_impact_score, ward_id, assigned_department, reported_at, sla_due_at)
VALUES (
    'a1000000-0000-0000-0000-000000000004',
    'SCA-20260820-G7H8',
    'Street Light', 'Outage',
    'Multiple street lights not working near Andheri sports complex creating unsafe conditions at night',
    4, 70.00, 'HIGH',
    '{"severity": 28.0, "safety_risk": 20.0, "location_risk": 12.0, "upvotes": 5.0, "age": 4.0}'::jsonb,
    'assigned', 2,
    (SELECT id FROM wards WHERE code = 'WARD-A'),
    'Roads & Infrastructure - West',
    NOW() - INTERVAL '14 hours',
    NOW() + INTERVAL '34 hours'
);

INSERT INTO locations (case_id, coordinates, latitude, longitude, address, ward_id, source)
VALUES (
    'a1000000-0000-0000-0000-000000000004',
    ST_SetSRID(ST_MakePoint(72.845, 19.115), 4326),
    19.115, 72.845,
    'Near Sports Complex, Andheri West, Mumbai 400053',
    (SELECT id FROM wards WHERE code = 'WARD-A'),
    'gps'
);

-- =====================
-- Case 5: Duplicate Pothole near Case 1 (linked to master)
-- =====================
INSERT INTO cases (id, case_number, category, subcategory, description, severity, priority_score, priority_label,
    priority_breakdown, status, community_impact_score, ward_id, assigned_department,
    master_case_id, reported_at, sla_due_at)
VALUES (
    'a1000000-0000-0000-0000-000000000005',
    'SCA-20260820-I9J0',
    'Pothole', 'Deep',
    'Dangerous pothole near Andheri metro, same location as earlier report',
    4, 85.00, 'CRITICAL',
    '{"severity": 28.0, "safety_risk": 20.0, "location_risk": 16.0, "upvotes": 10.0, "age": 1.0}'::jsonb,
    'submitted', 1,
    (SELECT id FROM wards WHERE code = 'WARD-A'),
    'Roads & Infrastructure - West',
    'a1000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '23 hours'
);

INSERT INTO locations (case_id, coordinates, latitude, longitude, address, ward_id, source)
VALUES (
    'a1000000-0000-0000-0000-000000000005',
    ST_SetSRID(ST_MakePoint(72.8462, 19.1192), 4326),
    19.1192, 72.8462,
    'Andheri Link Road, near Metro Station, Mumbai 400053',
    (SELECT id FROM wards WHERE code = 'WARD-A'),
    'gps'
);

-- =====================
-- Evidence for Case 1
-- =====================
INSERT INTO evidence (case_id, type, file_path, file_hash_sha256, mime_type, file_size_bytes,
    capture_timestamp, capture_location, tamper_check_result, is_before)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'photo',
    '/evidence/case1_pothole_before.jpg',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'image/jpeg', 245000,
    NOW() - INTERVAL '6 hours',
    ST_SetSRID(ST_MakePoint(72.846, 19.119), 4326),
    'passed', true
);

-- =====================
-- Assignment for Case 1
-- =====================
INSERT INTO assignments (case_id, work_order_number, department, team_id, status, due_at)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'WO-20260820-0001',
    'Roads & Infrastructure - West',
    'TEAM-ROAD-A1',
    'accepted',
    NOW() + INTERVAL '18 hours'
);

-- =====================
-- Agent Decisions
-- =====================
INSERT INTO agent_decisions (case_id, runtime, capability, model_name, model_version,
    confidence, reason, action_taken, processing_time_ms)
VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'intake', 'vision_classify', 'resnet50_civic', '1.0.0',
    0.92, 'Classified as Pothole/Deep with high confidence from image analysis',
    'Enriched case with AI classification', 340
),
(
    'a1000000-0000-0000-0000-000000000001',
    'priority', 'priority_engine', 'smart_civic_ai', '1.0.0',
    0.95, 'CRITICAL priority (92.5/100) due to severity 5, safety risk 4, location risk 4, 3 community reports',
    'Assigned priority CRITICAL, SLA 24h', 45
),
(
    'a1000000-0000-0000-0000-000000000005',
    'intake', 'spatial_dedup', 'postgis_dedup', '1.0.0',
    0.98, 'Duplicate detected 5m from master case SCA-20260820-A1B2 within 72h window',
    'Linked to master case, suppressed duplicate work order', 120
);

-- =====================
-- Volumetric Estimate for Case 1
-- =====================
INSERT INTO volumetric_estimates (case_id, depth_model, model_version,
    estimated_volume_m3, estimated_area_m2, estimated_depth_m,
    estimated_tonnage_kg, material_type, dispatch_guidance, confidence, processing_time_ms)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'depth_anything_v2_small', 'int8_v1',
    0.0850, 0.4200, 0.2024,
    204.00, 'cold_mix_asphalt',
    'Estimated 0.085m³ pothole requiring approximately 204kg of cold-mix asphalt. Recommend 1 standard repair truck.',
    0.78, 95
);

-- =====================
-- Audit Events
-- =====================
INSERT INTO audit_events (actor_type, actor_id, action, object_type, object_id, details)
VALUES
('system', 'intake_worker', 'CASE_CREATED', 'case', 'a1000000-0000-0000-0000-000000000001',
 '{"source": "citizen_pwa", "channel": "photo+gps"}'::jsonb),
('system', 'priority_worker', 'PRIORITY_ASSIGNED', 'case', 'a1000000-0000-0000-0000-000000000001',
 '{"score": 92.5, "label": "CRITICAL", "sla_hours": 24}'::jsonb),
('system', 'dedup_worker', 'DUPLICATE_DETECTED', 'case', 'a1000000-0000-0000-0000-000000000005',
 '{"master_case_id": "a1000000-0000-0000-0000-000000000001", "distance_m": 5}'::jsonb);
