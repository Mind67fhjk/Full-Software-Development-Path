import {
  ClipboardList,
  Palette,
  Database,
  Server,
  Monitor,
  CheckCircle,
  Rocket,
  RefreshCw,
  ChevronRight,
  Check,
} from "lucide-react";
import type { PhaseWithSteps } from "../lib/supabase";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  Palette,
  Database,
  Server,
  Monitor,
  CheckCircle,
  Rocket,
  RefreshCw,
};

type PhaseCardProps = {
  phase: PhaseWithSteps;
  isExpanded: boolean;
  onToggle: () => void;
  onStepClick: (stepId: string) => void;
};

export function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  onStepClick,
}: PhaseCardProps) {
  const Icon = iconMap[phase.icon] || ClipboardList;
  const completedSteps = phase.steps.filter(
    (step) => step.progress?.completed,
  ).length;
  const totalSteps = phase.steps.length;
  const progressPercent =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isComplete = completedSteps === totalSteps && totalSteps > 0;

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-500 ${
        isComplete
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-white/10 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)]"
      }`}
    >
      {/* Phase color progress glow */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 transition-all duration-700 ease-out"
          style={{
            background: `linear-gradient(90deg, ${phase.color}18 0%, transparent ${progressPercent}%)`,
          }}
        />
      </div>

      {/* Header */}
      <button
        onClick={onToggle}
        className="relative w-full p-5 sm:p-6 text-left focus:outline-none rounded-2xl"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg ${
              isComplete ? "bg-emerald-500" : ""
            }`}
            style={
              !isComplete
                ? { backgroundImage: `linear-gradient(135deg, ${phase.color}, ${phase.color}bb)` }
                : undefined
            }
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            {isComplete && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center ring-2 ring-[#050a18]">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                Phase {phase.order_index}
              </span>
              {isComplete && (
                <span className="text-xs font-semibold text-emerald-400">
                  Complete
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1">
              {phase.name}
            </h3>
            <p className="text-sm text-slate-400">{phase.description}</p>

            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700 ease-out rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: isComplete ? "#10B981" : phase.color,
                  }}
                />
              </div>
              <span className={`text-xs font-semibold ${isComplete ? "text-emerald-400" : "text-slate-400"}`}>
                {completedSteps}/{totalSteps}
              </span>
            </div>
          </div>

          {/* Chevron */}
          <ChevronRight
            className={`w-5 h-5 text-slate-500 transition-transform duration-300 flex-shrink-0 mt-1 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Steps list */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 sm:px-6 pb-5 space-y-2">
          <div className="h-px bg-white/10 mb-3" />
          {phase.steps.map((step, index) => {
            const isStepComplete = step.progress?.completed;
            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.id)}
                className={`w-full p-3 sm:p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ${
                  isStepComplete
                    ? "bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/60"
                    : "bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/8"
                }`}
              >
                {/* Step number */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isStepComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Step info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-semibold text-sm break-words ${
                      isStepComplete ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {step.description}
                  </p>
                </div>

                {/* Complete check */}
                {isStepComplete && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
