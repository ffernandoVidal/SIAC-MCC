-- Esquema de base de datos inicial para SIAC
-- Adaptar según el motor (PostgreSQL, MySQL, SQLite, etc.)

-- 1. Seguridad y acceso

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(200),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  object_type VARCHAR(100),
  object_id INT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Configuración de empresa

CREATE TABLE company_settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(100),
  base_currency CHAR(3) NOT NULL DEFAULT 'USD',
  timezone VARCHAR(100) DEFAULT 'UTC',
  journal_format VARCHAR(100) DEFAULT 'ANO-MES-DIA',
  system_rules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Catálogos maestros

CREATE TABLE account_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT
);

CREATE TABLE poliza_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT
);

CREATE TABLE poliza_statuses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT
);

CREATE TABLE document_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT
);

-- 4. Ejercicio fiscal y períodos contables

CREATE TABLE fiscal_years (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fiscal_periods (
  id SERIAL PRIMARY KEY,
  fiscal_year_id INT NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
  month INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (fiscal_year_id, month)
);

-- 5. Catálogo de cuentas

CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  parent_account_id INT REFERENCES accounts(id) ON DELETE SET NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  account_type_id INT REFERENCES account_types(id),
  nature VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_aggregated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Terceros y documentos fuente

CREATE TABLE third_parties (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(100),
  is_customer BOOLEAN DEFAULT FALSE,
  is_supplier BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE source_documents (
  id SERIAL PRIMARY KEY,
  document_type_id INT REFERENCES document_types(id),
  number VARCHAR(200) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  third_party_id INT REFERENCES third_parties(id),
  total_amount NUMERIC(18, 2) NOT NULL,
  currency CHAR(3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Registro de pólizas

CREATE TABLE polizas (
  id SERIAL PRIMARY KEY,
  poliza_number VARCHAR(100) NOT NULL UNIQUE,
  poliza_type_id INT REFERENCES poliza_types(id),
  status_id INT REFERENCES poliza_statuses(id),
  third_party_id INT REFERENCES third_parties(id),
  date DATE NOT NULL,
  description TEXT,
  total_debit NUMERIC(18, 2) NOT NULL DEFAULT 0,
  total_credit NUMERIC(18, 2) NOT NULL DEFAULT 0,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE poliza_lines (
  id SERIAL PRIMARY KEY,
  poliza_id INT NOT NULL REFERENCES polizas(id) ON DELETE CASCADE,
  account_id INT NOT NULL REFERENCES accounts(id),
  description TEXT,
  debit NUMERIC(18, 2) NOT NULL DEFAULT 0,
  credit NUMERIC(18, 2) NOT NULL DEFAULT 0,
  third_party_id INT REFERENCES third_parties(id),
  source_document_id INT REFERENCES source_documents(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Cierre contable

CREATE TABLE period_closures (
  id SERIAL PRIMARY KEY,
  fiscal_period_id INT NOT NULL REFERENCES fiscal_periods(id),
  closed_by INT REFERENCES users(id),
  closed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- 10. Auditoría completa (a nivel de tabla)

CREATE TABLE audit_trail (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id INT,
  operation VARCHAR(20) NOT NULL,
  user_id INT REFERENCES users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  before_data JSONB,
  after_data JSONB
);
