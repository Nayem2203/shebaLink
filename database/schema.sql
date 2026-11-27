-- ShebaLink PostgreSQL Database Schema (Future Backend Blueprint)
-- Aligned with doc/backend.md Section 5 and frontend src/types/index.ts
-- Note: The current lab prototype runs on LocalStorage and does not connect to PostgreSQL yet.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enumerated types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('active', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('verified', 'pending', 'unverified');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'Pending',
    'Accepted',
    'Rejected',
    'In Progress',
    'Completed',
    'Cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE complaint_status AS ENUM (
    'Open',
    'In Review',
    'Resolved',
    'Dismissed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  account_status account_status NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  city VARCHAR(60),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. provider_profiles
CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  professional_title VARCHAR(140) NOT NULL,
  bio TEXT NOT NULL,
  experience_years SMALLINT NOT NULL CHECK (experience_years >= 0),
  verification_status verification_status NOT NULL DEFAULT 'pending',
  service_area_text VARCHAR(160) NOT NULL,
  primary_city VARCHAR(60) NOT NULL DEFAULT 'Rajshahi',
  neighborhood VARCHAR(100),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. service_categories
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  service_group VARCHAR(60) NOT NULL,
  description TEXT NOT NULL,
  icon_key VARCHAR(60) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  parent_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. provider_services
CREATE TABLE IF NOT EXISTS provider_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  starting_price NUMERIC(10, 2) NOT NULL CHECK (starting_price >= 0),
  price_unit VARCHAR(30) NOT NULL DEFAULT 'per visit',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. provider_availability
CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (provider_id, weekday)
);

-- 6. bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  provider_service_id UUID NOT NULL REFERENCES provider_services(id) ON DELETE RESTRICT,
  problem_description TEXT NOT NULL,
  problem_image_url TEXT,
  service_address TEXT NOT NULL,
  preferred_at TIMESTAMPTZ NOT NULL,
  additional_instructions TEXT,
  status booking_status NOT NULL DEFAULT 'Pending',
  quoted_price NUMERIC(10, 2) CHECK (quoted_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. complaints
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  subject VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  status complaint_status NOT NULL DEFAULT 'Open',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Useful query indexes for service discovery and dashboards
CREATE INDEX IF NOT EXISTS idx_provider_profiles_city_verified
  ON provider_profiles (primary_city, verification_status);

CREATE INDEX IF NOT EXISTS idx_provider_services_category
  ON provider_services (category_id, is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_status
  ON bookings (customer_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_provider_status
  ON bookings (provider_id, status);

CREATE INDEX IF NOT EXISTS idx_reviews_provider
  ON reviews (provider_id, created_at DESC);
