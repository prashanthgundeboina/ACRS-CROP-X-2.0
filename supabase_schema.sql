-- =========================================================================
-- CroperX 2.0 Production Supabase PostgreSQL Schema (Phase 37)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'farmer_adviser', 'customer', 'admin')),
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted', 'pending')),
  phone_verified BOOLEAN NOT NULL DEFAULT true,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 2. Farmer Profiles Table
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  farm_name VARCHAR(255),
  farm_location VARCHAR(255),
  farm_size NUMERIC(10, 2) DEFAULT 5.0,
  farm_unit VARCHAR(20) DEFAULT 'metric',
  primary_crop VARCHAR(100) DEFAULT 'Rice',
  preferred_crop_cycle VARCHAR(255) DEFAULT 'Kharif Rice → Rabi Wheat → Summer Pulse',
  water_source VARCHAR(100) DEFAULT 'Borewell Drip Irrigation',
  soil_type VARCHAR(100) DEFAULT 'Alluvial Loam',
  target_ph NUMERIC(4, 2) DEFAULT 6.5,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  district VARCHAR(100),
  state VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Adviser Profiles Table
CREATE TABLE IF NOT EXISTS public.adviser_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  specialization VARCHAR(255) DEFAULT 'Plant Pathology & Crop Health',
  organization VARCHAR(255) DEFAULT 'Agricultural Extension Network',
  license_number VARCHAR(100),
  consultation_hours VARCHAR(100) DEFAULT '08:00 AM - 06:00 PM IST',
  bio TEXT,
  availability_status VARCHAR(50) DEFAULT 'available',
  rating NUMERIC(3, 2) DEFAULT 4.9,
  assigned_farmers_count INT DEFAULT 0,
  active_calls_today INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Customer Profiles Table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  customer_type VARCHAR(100) DEFAULT 'Commercial Farm Buyer',
  organization VARCHAR(255) DEFAULT 'Agro Commodities Trade',
  customer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Adviser Locations Table
CREATE TABLE IF NOT EXISTS public.adviser_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  adviser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  address TEXT,
  locality VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  is_verified BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Farmer Locations Table (Privacy Aware)
CREATE TABLE IF NOT EXISTS public.farmer_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  accuracy NUMERIC(8, 2),
  sharing_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Consultations Table
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  adviser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- 8. Meeting Requests Table
CREATE TABLE IF NOT EXISTS public.meeting_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  adviser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id VARCHAR(100),
  actor_role VARCHAR(50),
  action VARCHAR(255) NOT NULL,
  target_id VARCHAR(255),
  result VARCHAR(50) DEFAULT 'Success',
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adviser_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adviser_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for high throughput queries
CREATE INDEX IF NOT EXISTS idx_users_mobile ON public.users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON public.farmer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_adviser_profiles_user_id ON public.adviser_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_adviser_locations_adviser_id ON public.adviser_locations(adviser_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
