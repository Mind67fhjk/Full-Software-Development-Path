import { useState, useEffect } from "react";
import {
  supabase,
  getSessionId,
  type PhaseWithSteps,
  type StepWithProgress,
} from "./lib/supabase";
import { PhaseCard } from "./components/PhaseCard";
import { StepDetailModal } from "./components/StepDetailModal";
import {
  Loader2,
  Rocket,
  CheckCircle2,
  TrendingUp,
  Award,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

function App() {
  const [phases, setPhases] = useState<PhaseWithSteps[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<StepWithProgress | null>(
    null,
  );

  useEffect(() => {
    fetchPathway();
  }, []);

  async function fetchPathway() {
    const sessionId = getSessionId();
    try {
      const { data: phasesData, error: phasesError } = await supabase
        .from("development_phases")
        .select("*")
        .order("order_index");

      if (phasesError) throw phasesError;

      const { data: stepsData, error: stepsError } = await supabase
        .from("development_steps")
        .select("*")
        .order("order_index");

      if (stepsError) throw stepsError;

      const { data: progressData, error: progressError } = await supabase
        .from("step_progress")
        .select("*")
        .eq("session_id", sessionId);

      if (progressError) throw progressError;

      const phasesWithSteps: PhaseWithSteps[] = phasesData.map((phase) => ({
        ...phase,
        steps: stepsData
          .filter((step) => step.phase_id === phase.id)
          .map((step) => ({
            ...step,
            progress: progressData.find((p) => p.step_id === step.id) ?? null,
          })),
      }));

      setPhases(phasesWithSteps);
    } catch (error) {
      console.error("Failed to fetch pathway:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleTogglePhase = (phaseId: string) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  const handleStepClick = (stepId: string) => {
    for (const phase of phases) {
      const step = phase.steps.find((s) => s.id === stepId);
      if (step) {
        setSelectedStep(step);
        break;
      }
    }
  };

  const handleProgressUpdate = () => {
    fetchPathway();
  };

  // Calculate overall progress
  const totalSteps = phases.reduce((acc, p) => acc + p.steps.length, 0);
  const completedSteps = phases.reduce(
    (acc, p) => acc + p.steps.filter((s) => s.progress?.completed).length,
    0,
  );
  const overallProgress =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const phasesCompleted = phases.filter(
    (p) => p.steps.length > 0 && p.steps.every((s) => s.progress?.completed),
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a18] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Loading Elaja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a18] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_32%)]" />
        <div className="absolute inset-x-0 top-16 h-px bg-white/10" />
      </div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 py-0">
        <header className="flex items-center gap-3 py-4 px-1 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
            <span className="text-xl font-extrabold text-white">E</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Elaja</h1>
            <p className="text-xs text-slate-400">Development Pathway</p>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-cyan-500/20 bg-[rgba(255,255,255,0.05)] backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] px-6 py-8 md:px-8 md:py-9">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-[0.28em] text-cyan-300 mb-4 uppercase">
                About Me
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">
                Dedicated computer scientist
              </h2>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-7 sm:leading-8 max-w-3xl">
                I build practical software across networking, web and app
                development, cybersecurity, and other computer science projects.
                I am open to work on new projects.
              </p>
            </div>

            <a
              href="https://t.me/ElajaUnlocks"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 font-semibold hover:bg-cyan-500/20 transition-colors w-full sm:w-fit"
            >
              <MessageCircle className="w-5 h-5" />
              Telegram Channel
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        <section className="mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Rocket className="w-4 h-4" />
            Full-Stack Development Roadmap
          </div>
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Complete Development Pathway
          </h3>
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mb-8">
            Follow this comprehensive roadmap to build production-ready
            applications. Track your progress through each phase and ensure
            high-quality delivery.
          </p>

          {/* Overall progress card */}
          <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.25)] p-4 sm:p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/15 mb-3">
                  <TrendingUp className="w-6 h-6 text-cyan-300" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {Math.round(overallProgress)}%
                </div>
                <div className="text-sm text-slate-400">Overall Progress</div>
              </div>
              <div className="text-center p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15 mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {completedSteps}/{totalSteps}
                </div>
                <div className="text-sm text-slate-400">Steps Completed</div>
              </div>
              <div className="text-center p-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/15 mb-3">
                  <Award className="w-6 h-6 text-amber-300" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {phasesCompleted}/{phases.length}
                </div>
                <div className="text-sm text-slate-400">Phases Complete</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
              {overallProgress === 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow">
                    Complete!
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Phases */}
        <div className="space-y-4">
          {phases.map((phase, index) => {
            const previousPhase = phases[index - 1];
            const isPreviousComplete =
              index === 0 ||
              (previousPhase &&
                previousPhase.steps.length > 0 &&
                previousPhase.steps.every((s) => s.progress?.completed));

            return (
              <PhaseCard
                key={phase.id}
                phase={phase}
                isExpanded={expandedPhase === phase.id}
                onToggle={() => handleTogglePhase(phase.id)}
                onStepClick={handleStepClick}
                isPreviousComplete={isPreviousComplete}
              />
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-400 pb-12">
          <p>
            Track your journey through professional software development.
            Complete each step to ensure quality delivery.
          </p>
        </footer>
      </div>

      {/* Step detail modal */}
      {selectedStep && (
        <StepDetailModal
          step={selectedStep}
          onClose={() => setSelectedStep(null)}
          onUpdate={handleProgressUpdate}
        />
      )}
    </div>
  );
}

export default App;
