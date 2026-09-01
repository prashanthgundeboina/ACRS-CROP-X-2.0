-- ============================================================================
-- CROPX 2.0 - PHASE 46.1: AUTONOMOUS AI AGRICULTURE NETWORK DATABASE SCHEMA
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

-- 2. Farmer AI Agents Table (One isolated logical agent profile per farmer)
CREATE TABLE IF NOT EXISTS public.farmer_ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, ESCALATED, DISABLED
  automation_mode TEXT NOT NULL DEFAULT 'HYBRID',
  language TEXT NOT NULL DEFAULT 'en',
  confidence_score NUMERIC(5,2) DEFAULT 95.00,
  human_escalation_required BOOLEAN DEFAULT false,
  last_interaction_at TIMESTAMPTZ,
  last_analysis_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Farmer AI Memory Table (Persistent structured facts & summaries)
CREATE TABLE IF NOT EXISTS public.farmer_ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.farmer_ai_agents(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL, -- identity, farm, crops, actions, conversation, intelligence
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'AUTOMATED_INTERACTION',
  confidence NUMERIC(4,3) DEFAULT 0.950,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. AI Agent Interactions Table (Authoritative audit & interaction history)
CREATE TABLE IF NOT EXISTS public.ai_agent_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.farmer_ai_agents(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
  confidence NUMERIC(5,2) NOT NULL DEFAULT 95.00,
  input_summary TEXT NOT NULL,
  output_summary TEXT NOT NULL,
  recommended_actions JSONB,
  recommended_products JSONB,
  escalated BOOLEAN NOT NULL DEFAULT false,
  escalation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. AI Escalations Table (Assigned to Human Agronomist Queue)
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

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE & SECURITY ISOLATION
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_farmer_ai_memory_farmer_id ON public.farmer_ai_memory(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_ai_memory_type_key ON public.farmer_ai_memory(farmer_id, memory_type, memory_key);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_farmer_id ON public.ai_agent_interactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_ai_escalations_status ON public.ai_escalations(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) ENFORCEMENT
-- ============================================================================
ALTER TABLE public.ai_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_escalations ENABLE ROW LEVEL SECURITY;

-- Farmer access policies (Farmers access only their own agent, memories, and interactions)
CREATE POLICY "Farmers can read their own agent profile"
  ON public.farmer_ai_agents FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can read their own memory items"
  ON public.farmer_ai_memory FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can read their own interactions"
  ON public.ai_agent_interactions FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can read their own escalations"
  ON public.ai_escalations FOR SELECT
  USING (auth.uid() = farmer_id);

-- Admins and Service Role have full management access
CREATE POLICY "Service Role full access on AI tables"
  ON public.ai_automation_settings FOR ALL
  USING (true)
  WITH CHECK (true);
