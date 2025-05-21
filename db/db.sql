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
  external_id VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  election_type_id INTEGER REFERENCES election_types(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  external_id VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS municipalities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  zip_code VARCHAR(10),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  active BOOLEAN DEFAULT TRUE,
  external_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS polling_stations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  address VARCHAR(255),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  active BOOLEAN DEFAULT TRUE,
  external_id VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  municipality_id INTEGER REFERENCES municipalities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS polling_station_stats (
  id SERIAL PRIMARY KEY,
  total_votes INT NOT NULL CHECK (total_votes >= 0),
  votes INT NOT NULL CHECK (votes >= 0),
  valid_votes INT NOT NULL CHECK (valid_votes >= 0 AND valid_votes <= votes),
  invalid_votes INT NOT NULL CHECK (invalid_votes >= 0 AND invalid_votes <= (votes - valid_votes)),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  polling_station_id INTEGER REFERENCES polling_stations(id) ON DELETE CASCADE,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  photo_path VARCHAR(255),
  biography TEXT,
  description TEXT,
  minority BOOLEAN DEFAULT FALSE,
  external_id VARCHAR(50) UNIQUE NOT NULL,
  list_number INT NOT NULL CHECK (list_number > 0),
  is_independent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS station_results (
  id SERIAL PRIMARY KEY,
  votes INT NOT NULL CHECK (votes >= 0),
  document_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
  polling_station_id INTEGER REFERENCES polling_stations(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  percentage DECIMAL(5, 2) CHECK (percentage >= 0 AND percentage <= 100)
);



-- CREATE TABLE IF NOT EXISTS political_parties (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   description TEXT,
--   minority BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE IF NOT EXISTS coalitions (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   description TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE IF NOT EXISTS coalition_parties (
--   coalition_id INTEGER REFERENCES coalitions(id) ON DELETE CASCADE,
--   party_id INTEGER REFERENCES political_parties(id) ON DELETE CASCADE,
--   PRIMARY KEY (coalition_id, party_id)
-- );

-- CREATE TABLE IF NOT EXISTS candidate_affiliations (
--   id SERIAL PRIMARY KEY,
--   candidate_id INT REFERENCES candidates(id) ON DELETE CASCADE,
--   party_id INT REFERENCES political_parties(id),
--   coalition_id INT REFERENCES coalitions(id),
--   election_id INT REFERENCES elections(id) ON DELETE CASCADE,
--   CHECK (
--     (party_id IS NOT NULL AND coalition_id IS NULL)
--     OR (party_id IS NULL AND coalition_id IS NOT NULL)
--     OR (party_id IS NULL AND coalition_id IS NULL)
-- );


CREATE TABLE IF NOT EXISTS election_observers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  organization VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
  polling_station_id INTEGER REFERENCES polling_stations(id) ON DELETE CASCADE
);

INSERT INTO election_types (name) VALUES ('Parlamentarni');
INSERT INTO election_types (name) VALUES ('Predsednički');
INSERT INTO elections (round_number, name, description,  active, external_id, election_type_id) VALUES (1, 'Parlamentarni izbori 2023', '', true, '1', 1);

INSERT INTO candidates (name, external_id, list_number, minority) VALUES
('ИЗБОРНА ЛИСТА АЛЕКСАНДАР ВУЧИЋ - СРБИЈА НЕ СМЕ ДА СТАНЕ', 1, 1, false),
('ИЗБОРНА ЛИСТА ИВИЦА ДАЧИЋ – ПРЕМИЈЕР СРБИЈЕ', 2, 2, false),
('ИЗБОРНА ЛИСТА ДР ВОЈИСЛАВ ШЕШЕЉ - СРПСКА РАДИКАЛНА СТРАНКА', 3, 3, false),
('ИЗБОРНА ЛИСТА МИЛИЦА ЂУРЂЕВИЋ СТАМЕНКОВСКИ - БОШКО ОБРАДОВИЋ - НАЦИОНАЛНО ОКУПЉАЊЕ - ДРЖАВОТВОРНА СНАГА - СРПСКА СТРАНКА ЗАВЕТНИЦИ - СРПСКИ ПОКРЕТ ДВЕРИ', 4, 4, false),
('ИЗБОРНА ЛИСТА ДР МИЛОШ ЈОВАНОВИЋ – НАДА ЗА СРБИЈУ – СРПСКА КОАЛИЦИЈА НАДА – НАЦИОНАЛНО ДЕМОКРАТСКА АЛТЕРНАТИВА – НОВА ДЕМОКРАТСКА СТРАНКА СРБИЈЕ ( НOВИ ДСС) – ПОКРЕТ ОБНОВЕ КРАЉЕВИНЕ СРБИЈЕ (ПОКС) – ВОЈИСЛАВ МИХАИЛОВИЋ', 5, 5, false),
('ИЗБОРНА ЛИСТА VАJDASÁGI MAGYAR SZÖVETSÉG – ELNÖKÜNKÉRT, KÖZÖSSÉGÜNKÉRT, A JÖVŐÉRT! – САВЕЗ ВОЈВОЂАНСКИХ МАЂАРА – ЗА НАШЕГ ПРЕДСЕДНИКА, ЗА НАШУ ЗАЈЕДНИЦУ, ЗА БУДУЋНОСТ!', 6, 6, false),
('ИЗБОРНА ЛИСТА СРБИЈА ПРОТИВ НАСИЉА – МИРОСЛАВ МИКИ АЛЕКСИЋ - МАРИНИКА ТЕПИЋ (СТРАНКА СЛОБОДЕ И ПРАВДЕ, НАРОДНИ ПОКРЕТ СРБИЈЕ, ЗЕЛЕНО-ЛЕВИ ФРОНТ, НЕ ДАВИМО БЕОГРАД, ЕКОЛОШКИ УСТАНАК – ЋУТА, ДЕМОКРАТСКА СТРАНКА, ПОКРЕТ СЛОБОДНИХ ГРАЂАНА, СРБИЈА ЦЕНТАР, ЗАЈЕДНО, ПОКРЕТ ЗА ПРЕОКРЕТ, УДРУЖЕНИ СИНДИКАТИ СРБИЈЕ „СЛОГА“, НОВО ЛИЦЕ СРБИЈЕ)', 7, 7, false),
('ИЗБОРНА ЛИСТА USAME ZUKORLIĆ – UJEDINJENI ZA PRAVDU – STRANKA PRAVDE I POMIRENJA – BOŠNJACI SANDŽAKA, TOMISLAV ŽIGMANOV - DEMOKRATSKI SAVEZ HRVATA U VOJVODINI / УСАМЕ ЗУКОРЛИЋ – УЈЕДИЊЕНИ ЗА ПРАВДУ – СТРАНКА ПРАВДЕ И ПОМИРЕЊА – БОШЊАЦИ САНЏАКА, ТОМИСЛАВ ЖИГМАНОВ - ДЕМОКРАТСКИ САВЕЗ ХРВАТА У ВОЈВОДИНИ', 8, 8, false),
('ИЗБОРНА ЛИСТА СДА САНЏАКА - ДР СУЛЕЈМАН УГЉАНИН SDA SANDŽAKA – DR. SULEJMAN UGLJANIN', 9, 9, false),
('ИЗБОРНА ЛИСТА ЗАЈЕДНО ЗА БУДУЋНОСТ И РАЗВОЈ – КОАЛИЦИЈА ЗА МИР И ТОЛЕРАНЦИЈУ', 10, 10, false),
('ИЗБОРНА ЛИСТА НАРОДНА СТРАНКА – СИГУРАН ИЗБОР. ОЗБИЉНИ ЉУДИ – ВУК ЈЕРЕМИЋ, ДР САНДА РАШКОВИЋ ИВИЋ, СИНИША КОВАЧЕВИЋ, ВЛАДИМИР ГАЈИЋ, МАРИНА ЛИПОВАЦ ТАНАСКОВИЋ', 11, 11, false),
('ИЗБОРНА ЛИСТА САША РАДУЛОВИЋ (ДОСТА ЈЕ БИЛО - ДЈБ) - БОРИС ТАДИЋ (СОЦИЈАЛДЕМОКРАТСКА СТРАНКА - СДС) - АНА ПЕЈИЋ (ОТЕТЕ БЕБЕ) - ДОБРО ЈУТРО СРБИЈО', 12, 12, false),
('ИЗБОРНА ЛИСТА “ПОЛИТИЧКА БОРБА АЛБАНАЦА СЕ НАСТАВЉА – ШАИП КАМБЕРИ“ “BETEJA POLITIKE E SHQIPTARËVE VAZHDON – SHAIP KAMBERI', 13, 13, true),
('ИЗБОРНА ЛИСТА МИ-ГЛАС ИЗ НАРОДА, ПРОФ. ДР БРАНИМИР НЕСТОРОВИЋ', 14, 14, false),
('ИЗБОРНА ЛИСТА СРБИЈА НА ЗАПАДУ – ЗОРАН ВУЛЕТИЋ – НЕМАЊА МИЛОШЕВИЋ – ДА СЕ СТРУКА ПИТА – ВЛАДИМИР КОВАЧЕВИЋ', 15, 15, false),
('ИЗБОРНА ЛИСТА РУСКА СТРАНКА – СЛОБОДАН НИКОЛИЋ', 16, 16, false),
('ИЗБОРНА ЛИСТА ЧЕДОМИР ЈОВАНОВИЋ – МОРА ДРУГАЧИЈЕ', 17, 17, false),
('ИЗБОРНА ЛИСТА АЛБАНСКА ДЕМОКРАТСКА АЛТЕРНАТИВА – УЈЕДИЊЕНА ДОЛИНА ALTERNATIVA DEMOKRATIKE SHQIPTARE-LUGINA E BASHKUAR', 18, 18, true);