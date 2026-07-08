import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Anonymous session: each visitor gets a unique ID stored in localStorage
const SESSION_KEY = 'elaja_session_id';

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export type DevelopmentPhase = {
  id: string;
  name: string;
  description: string;
  order_index: number;
  icon: string;
  color: string;
  created_at: string;
};

export type DevelopmentStep = {
  id: string;
  phase_id: string;
  title: string;
  description: string;
  order_index: number;
  details: {
    items: string[];
    tips: string[];
  };
  created_at: string;
};

export type StepProgress = {
  id: string;
  step_id: string;
  session_id: string;
  completed: boolean;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
};

export type StepWithProgress = DevelopmentStep & {
  progress: StepProgress | null;
};

export type PhaseWithSteps = DevelopmentPhase & {
  steps: StepWithProgress[];
};
