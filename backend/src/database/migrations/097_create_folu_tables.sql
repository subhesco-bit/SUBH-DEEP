-- Migration: Create FOLU (Forest & Organic Land Use) tables
-- Author: Claude Haiku
-- Date: 2026-09-20

-- Forest Tracts table
CREATE TABLE IF NOT EXISTS forest_tracts (
  id VARCHAR(100) PRIMARY KEY,
  farmerId VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'REGISTERED',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmerId) REFERENCES users(id)
);

CREATE INDEX idx_forest_tracts_farmerId ON forest_tracts(farmerId);
CREATE INDEX idx_forest_tracts_status ON forest_tracts(status);

-- Agroforestry Designs table
CREATE TABLE IF NOT EXISTS agroforestry_designs (
  id VARCHAR(100) PRIMARY KEY,
  tractId VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'DESIGNED',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tractId) REFERENCES forest_tracts(id)
);

CREATE INDEX idx_agroforestry_tractId ON agroforestry_designs(tractId);

-- Carbon Credits table
CREATE TABLE IF NOT EXISTS carbon_credits (
  id VARCHAR(100) PRIMARY KEY,
  tractId VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'CALCULATED',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tractId) REFERENCES forest_tracts(id),
  UNIQUE(tractId, year)
);

CREATE INDEX idx_carbon_credits_tractId ON carbon_credits(tractId);
CREATE INDEX idx_carbon_credits_year ON carbon_credits(year);
