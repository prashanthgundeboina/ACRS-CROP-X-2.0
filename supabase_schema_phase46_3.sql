-- ============================================================================
-- CROPERX 2.0 - PHASE 46.3: AUTONOMOUS AI AGRICULTURE NETWORK SCHEMA
-- Agent Orchestration, Isolated Memory, Continuous Learning & Proactive Automation
-- ============================================================================

-- 1. Table: farmer_ai_agents
CREATE TABLE IF NOT EXISTS public.farmer_ai_agents (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL UNIQUE,
  farmer_name TEXT NOT NULL,
  phone_number TEXT,
  location TEXT,
  primary_crop TEXT DEFAULT 'Paddy',
  farm_size_acres NUMERIC(6, 2) DEFAULT 3.0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'DISABLED')),
  safety_state TEXT NOT NULL DEFAULT 'NORMAL' CHECK (safety_state IN ('NORMAL', 'EVALUATION', 'RESTRICTED', 'LOCKED')),
  automation_mode TEXT NOT NULL DEFAULT 'HYBRID' CHECK (automation_mode IN ('MANUAL', 'AI_ASSIST', 'HYBRID', 'AUTONOMOUS', 'PROACTIVE_AUTONOMOUS')),
  agent_version TEXT NOT NULL DEFAULT 'v46.3.0',
  language TEXT NOT NULL DEFAULT 'en',
  confidence_score NUMERIC(5, 2) DEFAULT 95.0,
  human_escalation_required BOOLEAN DEFAULT FALSE,
  last_interaction_at TIMESTAMPTZ,
  last_analysis_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  active_issues_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table: farmer_ai_memories (Strict Isolation by farmer_id)
CREATE TABLE IF NOT EXISTS public.farmer_ai_memories (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES public.farmer_ai_agents(farmer_id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  memory_type TEXT NOT NULL CHECK (memory_type IN (
    'permanent_memory', 'seasonal_memory', 'conversation_memory', 'verified_outcome_memory',
    'identity', 'farm', 'crops', 'actions', 'conversation', 'intelligence'
  )),
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  source TEXT NOT NULL,
  confidence NUMERIC(4, 2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  superseded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table: ai_agent_tasks (Idempotent task queue)
CREATE TABLE IF NOT EXISTS public.ai_agent_tasks (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_details TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table: ai_agent_events (Event stream & deduplication)
CREATE TABLE IF NOT EXISTS public.ai_agent_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  farmer_id TEXT,
  farmer_name TEXT,
  source TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT,
  processed BOOLEAN DEFAULT TRUE,
  recommendation_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Table: ai_recommendations (Explainable AI recommendations)
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL UNIQUE,
  farmer_id TEXT NOT NULL,
  specialist_agents_used TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  farm_context_used JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendation TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'LOW' CHECK (urgency IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 95.0,
  risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  reasoning_summary TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  requires_confirmation BOOLEAN DEFAULT FALSE,
  requires_human_review BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONFIRMED', 'REJECTED', 'EXECUTED', 'EXPIRED')),
  farmer_action TEXT DEFAULT 'PENDING',
  outcome_observed TEXT,
  outcome_validated BOOLEAN DEFAULT FALSE,
  explainability JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommended_products JSONB DEFAULT '[]'::jsonb,
  recommended_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Table: ai_recommendation_outcomes (Continuous Learning Pipeline)
CREATE TABLE IF NOT EXISTS public.ai_recommendation_outcomes (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL REFERENCES public.ai_recommendations(recommendation_id) ON DELETE CASCADE,
  farmer_id TEXT NOT NULL,
  action TEXT NOT NULL,
  outcome_text TEXT,
  yield_impact TEXT,
  validated BOOLEAN DEFAULT FALSE,
  validation_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Table: ai_feedback (Farmer satisfaction & feedback)
CREATE TABLE IF NOT EXISTS public.ai_feedback (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  interaction_id TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'followed_recommendation', 'outcome_good', 'outcome_bad')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Table: ai_escalations (Certified Agronomist Tickets)
CREATE TABLE IF NOT EXISTS public.ai_escalations (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  farmer_phone TEXT,
  agent_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'RESOLVED', 'DISMISSED')),
  assigned_adviser_id TEXT,
  assigned_adviser_name TEXT,
  context_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 9. Table: ai_safety_events (Policy Gate Blocks & Kill Switch Audits)
CREATE TABLE IF NOT EXISTS public.ai_safety_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Table: ai_network_metrics (Network-wide Trust Score & Telemetry)
CREATE TABLE IF NOT EXISTS public.ai_network_metrics (
  id TEXT PRIMARY KEY,
  total_active_agents INTEGER NOT NULL DEFAULT 0,
  agents_paused INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_failed INTEGER NOT NULL DEFAULT 0,
  average_execution_time_ms INTEGER NOT NULL DEFAULT 150,
  safety_blocks INTEGER NOT NULL DEFAULT 0,
  human_escalations INTEGER NOT NULL DEFAULT 0,
  recommendation_accuracy NUMERIC(5, 2) NOT NULL DEFAULT 95.0,
  farmer_satisfaction NUMERIC(5, 2) NOT NULL DEFAULT 96.0,
  verified_outcome_success NUMERIC(5, 2) NOT NULL DEFAULT 92.0,
  unsafe_recommendations INTEGER NOT NULL DEFAULT 0,
  repeated_failures INTEGER NOT NULL DEFAULT 0,
  ai_trust_score NUMERIC(5, 2) NOT NULL DEFAULT 96.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES & CONSTRAINTS FOR STRICT DATA ISOLATION & HIGH PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_farmer_ai_memories_farmer_id ON public.farmer_ai_memories(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_ai_memories_active ON public.farmer_ai_memories(farmer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_agent_tasks_farmer_status ON public.ai_agent_tasks(farmer_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_events_key ON public.ai_agent_events(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_farmer ON public.ai_recommendations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_urgency ON public.ai_recommendations(urgency, status);
CREATE INDEX IF NOT EXISTS idx_ai_escalations_status ON public.ai_escalations(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) FOR FARMER MEMORY ISOLATION
-- ============================================================================

ALTER TABLE public.farmer_ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_ai_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_escalations ENABLE ROW LEVEL SECURITY;

-- Farmer can only access their own private memories & recommendations
CREATE POLICY farmer_memories_isolation_select ON public.farmer_ai_memories
  FOR SELECT USING (farmer_id = current_setting('request.jwt.claim.sub', true) OR current_setting('request.jwt.claim.role', true) = 'admin');

CREATE POLICY farmer_recommendations_isolation_select ON public.ai_recommendations
  FOR SELECT USING (farmer_id = current_setting('request.jwt.claim.sub', true) OR current_setting('request.jwt.claim.role', true) = 'admin');

CREATE POLICY farmer_tasks_isolation_select ON public.ai_agent_tasks
  FOR SELECT USING (farmer_id = current_setting('request.jwt.claim.sub', true) OR current_setting('request.jwt.claim.role', true) = 'admin');
