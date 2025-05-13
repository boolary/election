CREATE TABLE IF NOT EXISTS election_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS elections (
  id SERIAL PRIMARY KEY,
  round_number INT NOT NULL CHECK (round_number > 0),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  election_type_id INTEGER REFERENCES election_types(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS municipalities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  zip_code VARCHAR(10),
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS polling_stations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  municipality_id INTEGER REFERENCES municipalities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS polling_station_voters (
  id SERIAL PRIMARY KEY,
  number_of_voters INT NOT NULL CHECK (number_of_voters >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  polling_station_id INTEGER REFERENCES polling_stations(id) ON DELETE CASCADE,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  party VARCHAR(50),
  photo_path VARCHAR(255),
  biography TEXT,
  list_name VARCHAR(100),
  description TEXT,
  minority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS station_results (
  id SERIAL PRIMARY KEY,
  votes INT NOT NULL CHECK (votes >= 0),
  valid_votes INT NOT NULL CHECK (valid_votes >= 0),
  invalid_votes INT NOT NULL CHECK (invalid_votes >= 0),
  blank_votes INT NOT NULL CHECK (blank_votes >= 0),
  document_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
  polling_station_id INTEGER REFERENCES polling_stations(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS election_audits (
  id SERIAL PRIMARY KEY,
  audit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  audit_result TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS election_observers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  organization VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE
);