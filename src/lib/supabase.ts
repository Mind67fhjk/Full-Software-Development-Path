import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Anonymous session: persisted in both localStorage and a 1-year cookie
// so progress survives localStorage clears
const SESSION_KEY = 'elaja_session_id';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  const maxAge = 60 * 60 * 24 * 365; // 1 year in seconds
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function getSessionId(): string {
  // Try localStorage first, then cookie
  let sessionId = localStorage.getItem(SESSION_KEY) ?? getCookie(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  // Always keep both in sync
  localStorage.setItem(SESSION_KEY, sessionId);
  setCookie(SESSION_KEY, sessionId);
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
