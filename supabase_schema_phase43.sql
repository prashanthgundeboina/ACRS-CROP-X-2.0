-- =========================================================================
-- CroperX 2.0 Production Supabase PostgreSQL Schema (Phase 43 Extension)
-- =========================================================================

-- 10. Adviser Applications & Verification Table
CREATE TABLE IF NOT EXISTS public.adviser_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  mobile VARCHAR(20) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  specialization VARCHAR(255) NOT NULL DEFAULT 'General Agronomy & Crop Health',
  years_of_experience NUMERIC(4, 1) DEFAULT 0,
  qualification VARCHAR(255) NOT NULL DEFAULT 'B.Sc Agriculture',
  institution VARCHAR(255),
  primary_crops TEXT[] DEFAULT '{}',
  secondary_crops TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{"English", "Hindi"}',
  region VARCHAR(255),
  district VARCHAR(100),
  state VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'ASSESSMENT_REQUIRED' CHECK (
    status IN (
      'REGISTERED',
      'OTP_VERIFIED',
      'ASSESSMENT_REQUIRED',
      'NOT_ELIGIBLE',
      'PENDING_ADMIN_REVIEW',
      'APPROVED',
      'REJECTED',
      'ACTIVATION_REQUIRED',
      'LEARNING_REQUIRED',
      'ACTIVE'
    )
  ),
  assessment_score INT DEFAULT 0,
  assessment_total INT DEFAULT 50,
  assessment_percentage INT DEFAULT 0,
  assessment_submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(255),
  rejection_reason TEXT,
  password_setup_completed BOOLEAN DEFAULT false,
  course_completed BOOLEAN DEFAULT false,
  mastery_score INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Adviser Assessment Attempts Table (Authoritative Server Scoring Logs)
CREATE TABLE IF NOT EXISTS public.adviser_assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.adviser_applications(id) ON DELETE CASCADE,
  mobile VARCHAR(20) NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score INT NOT NULL,
  total INT NOT NULL DEFAULT 50,
  percentage INT NOT NULL,
  is_eligible BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Adviser Activation Tokens (Single-Use Hashed Tokens)
CREATE TABLE IF NOT EXISTS public.adviser_activation_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.adviser_applications(id) ON DELETE CASCADE,
  mobile VARCHAR(20) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Adviser Course Progress Tracking
CREATE TABLE IF NOT EXISTS public.adviser_course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile VARCHAR(20) NOT NULL UNIQUE,
  completed_modules TEXT[] DEFAULT '{}',
  progress_percentage INT DEFAULT 0,
  last_active_module VARCHAR(100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Adviser Mastery Assessment Attempts
CREATE TABLE IF NOT EXISTS public.adviser_mastery_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile VARCHAR(20) NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score INT NOT NULL,
  total INT NOT NULL DEFAULT 15,
  percentage INT NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security RLS
ALTER TABLE public.adviser_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adviser_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adviser_activation_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adviser_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adviser_mastery_attempts ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_adviser_applications_mobile ON public.adviser_applications(mobile);
CREATE INDEX IF NOT EXISTS idx_adviser_applications_status ON public.adviser_applications(status);
CREATE INDEX IF NOT EXISTS idx_adviser_activation_tokens_mobile ON public.adviser_activation_tokens(mobile);
CREATE INDEX IF NOT EXISTS idx_adviser_course_progress_mobile ON public.adviser_course_progress(mobile);
