-- ============================================================================
-- CROPX 2.0 - PHASE 46.2: AUTONOMOUS AI AGRICULTURE NETWORK PRODUCTION SCHEMA
-- ============================================================================

-- 1. AI Automation Global Settings Table
CREATE TABLE IF NOT EXISTS public.ai_automation_settings (
  id TEXT PRIMARY KEY DEFAULT 'GLOBAL_SETTINGS',
  automation_enabled BOOLEAN NOT NULL DEFAULT true,
  automation_mode TEXT NOT NULL DEFAULT 'HYBRID', -- MANUAL, AI_ASSIST, HYBRID, AUTONOMOUS, PROACTIVE_AUTONOMOUS
  emergency_stop BOOLEAN NOT NULL DEFAULT false,
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Farmer AI Agents Table
CREATE TABLE IF NOT EXISTS public.farmer_ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, ESCALATED, DISABLED, ERROR
  safety_state TEXT NOT NULL DEFAULT 'NORMAL', -- NORMAL, EVALUATION, RESTRICTED, LOCKED
  automation_mode TEXT NOT NULL DEFAULT 'HYBRID',
  agent_version TEXT NOT NULL DEFAULT 'v2.0-prod',
  language TEXT NOT NULL DEFAULT 'en',
  confidence_score NUMERIC(5,2) DEFAULT 95.00,
  human_escalation_required BOOLEAN DEFAULT false,
  last_interaction_at TIMESTAMPTZ,
  last_analysis_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  active_issues_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Farmer AI Memory Table (Structured memory, verified facts, and superseding)
CREATE TABLE IF NOT EXISTS public.farmer_ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.farmer_ai_agents(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL, -- farmer_profile, soil_memory, crop_memory, advisory_memory, environmental_memory, conversation_memory
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'AUTOMATED_INTERACTION',
  confidence NUMERIC(4,3) DEFAULT 0.950,
  is_active BOOLEAN NOT NULL DEFAULT true,
  superseded_by UUID REFERENCES public.farmer_ai_memory(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Farmer AI Tasks Table (Event-driven and scheduled autonomous tasks)
CREATE TABLE IF NOT EXISTS public.farmer_ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.farmer_ai_agents(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL, -- crop_monitoring, soil_analysis, irrigation_review, weather_check, disease_risk_scan, advisory_followup, escalation_check
  status TEXT NOT NULL DEFAULT 'queued', -- queued, running, completed, failed, cancelled
  risk_level TEXT NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  error_details TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  executed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. AI Agent Interactions Table
CREATE TABLE IF NOT EXISTS public.ai_agent_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.farmer_ai_agents(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'LOW',
  confidence NUMERIC(5,2) NOT NULL DEFAULT 95.00,
  input_summary TEXT NOT NULL,
  output_summary TEXT NOT NULL,
  recommended_actions JSONB,
  recommended_products JSONB,
  escalated BOOLEAN NOT NULL DEFAULT false,
  escalation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Farmer AI Feedback Table
CREATE TABLE IF NOT EXISTS public.farmer_ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.farmer_ai_agents(id) ON DELETE CASCADE,
  interaction_id UUID REFERENCES public.ai_agent_interactions(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL, -- helpful, not_helpful, followed_recommendation, outcome_good, outcome_bad
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. AI Anomalies Table
CREATE TABLE IF NOT EXISTS public.ai_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_type TEXT NOT NULL, -- REPEATED_AGENT_FAILURES, EXCESSIVE_TASK_CREATION, UNUSUAL_RECOMMENDATION_FREQUENCY, MEMORY_RETRIEVAL_ERRORS, REPEATED_LOW_CONFIDENCE
  severity TEXT NOT NULL DEFAULT 'WARNING', -- WARNING, CRITICAL
  details TEXT NOT NULL,
  agent_id UUID REFERENCES public.farmer_ai_agents(id) ON DELETE SET NULL,
  farmer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ
);

-- 8. AI Escalations Table
CREATE TABLE IF NOT EXISTS public.ai_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.farmer_ai_agents(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, ASSIGNED, RESOLVED, DISMISSED
  assigned_adviser_id UUID,
  context_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

-- 9. AI Audit Logs Table
CREATE TABLE IF NOT EXISTS public.ai_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- PERFORMANCE & ISOLATION INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_p46_farmer_ai_agents_farmer_id ON public.farmer_ai_agents(farmer_id);
CREATE INDEX IF NOT EXISTS idx_p46_farmer_ai_memory_farmer_id ON public.farmer_ai_memory(farmer_id);
CREATE INDEX IF NOT EXISTS idx_p46_farmer_ai_memory_active ON public.farmer_ai_memory(farmer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_p46_farmer_ai_tasks_farmer_id ON public.farmer_ai_tasks(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_p46_farmer_ai_tasks_scheduled ON public.farmer_ai_tasks(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_p46_ai_interactions_farmer_id ON public.ai_agent_interactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_p46_farmer_ai_feedback_farmer_id ON public.farmer_ai_feedback(farmer_id);
CREATE INDEX IF NOT EXISTS idx_p46_ai_anomalies_resolved ON public.ai_anomalies(resolved, severity);
CREATE INDEX IF NOT EXISTS idx_p46_ai_escalations_status ON public.ai_escalations(status);
CREATE INDEX IF NOT EXISTS idx_p46_ai_audit_logs_timestamp ON public.ai_audit_logs(timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.ai_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Farmer isolate policies
CREATE POLICY "Farmers can read their own agent profile p46"
  ON public.farmer_ai_agents FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can read their own memory items p46"
  ON public.farmer_ai_memory FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can read their own tasks p46"
  ON public.farmer_ai_tasks FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can read their own interactions p46"
  ON public.ai_agent_interactions FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert feedback p46"
  ON public.farmer_ai_feedback FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can read their own feedback p46"
  ON public.farmer_ai_feedback FOR SELECT
  USING (auth.uid() = farmer_id);
