-- Folded from backend/src/modules/M032/model.sql (AUDIT_DB.md Finding 11/13 remediation)
-- Soil Analysis Schema (M032) / -- Comprehensive soil testing and analysis with AI-powered recommendations
-- Generated 2026-08-30 — DB linkage fix, see .ai/tasks/ACTIVE.md

-- 2026-09-12: `soil_samples` renamed to `m032_soil_samples`.
--
-- This file runs before m010_soil_nutrient_land_schema.sql, so its narrow
-- VARCHAR-keyed table won the name and m010's CREATE silently no-opped. That
-- was the wrong winner: backend/src/services/soilNutrientLandService.js
-- inserts m010's column list (sample_id, farmer_id, farm_id, location, state,
-- district, sample_depth, sample_type, crop_planned, irrigation_type,
-- collection_date, collector_name, lab_preference, ai_optimization) and
-- updates `WHERE id = $2` against m010's UUID primary key — none of which
-- exist here. m010 also declares `soil_analysis.sample_id UUID REFERENCES
-- soil_samples(id)`, which cannot be created against this table's
-- `sample_id VARCHAR(50)` primary key and aborts the migration run.
--
-- M032's service (backend/src/modules/M032/service.js) queries `suppliers`,
-- not this table, so renaming it frees the name for the definition the
-- application actually uses.
CREATE TABLE IF NOT EXISTS m032_soil_samples (
    sample_id VARCHAR(50) PRIMARY KEY,
    farmer_id VARCHAR(50) NOT NULL,
    parcel_id VARCHAR(50),
    sample_date DATE NOT NULL,
    sample_depth DECIMAL(5,2),
    sample_location JSONB,
    soil_type VARCHAR(50),
    ph_level DECIMAL(5,2),
    organic_matter DECIMAL(5,2),
    nitrogen DECIMAL(5,2),
    phosphorus DECIMAL(5,2),
    potassium DECIMAL(5,2),
    calcium DECIMAL(5,2),
    magnesium DECIMAL(5,2),
    sulfur DECIMAL(5,2),
    iron DECIMAL(5,2),
    zinc DECIMAL(5,2),
    copper DECIMAL(5,2),
    manganese DECIMAL(5,2),
    boron DECIMAL(5,2),
    electrical_conductivity DECIMAL(5,2),
    cation_exchange_capacity DECIMAL(5,2),
    texture VARCHAR(50),
    structure VARCHAR(50),
    water_holding_capacity DECIMAL(5,2),
    ai_health_score DECIMAL(5,2),
    ai_recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soil_health_reports (
    report_id VARCHAR(50) PRIMARY KEY,
    sample_id VARCHAR(50) NOT NULL REFERENCES m032_soil_samples(sample_id),
    overall_health VARCHAR(20),
    fertility_rating VARCHAR(20),
    suitability_rating JSONB,
    nutrient_deficiencies JSONB,
    recommended_amendments JSONB,
    recommended_crops JSONB,
    irrigation_recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_m032_soil_samples_farmer ON m032_soil_samples(farmer_id);

CREATE INDEX IF NOT EXISTS idx_m032_soil_samples_parcel ON m032_soil_samples(parcel_id);

CREATE INDEX IF NOT EXISTS idx_m032_soil_samples_date ON m032_soil_samples(sample_date);

CREATE INDEX IF NOT EXISTS idx_soil_health_reports_sample ON soil_health_reports(sample_id);
