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
  Clock,
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
  isPreviousComplete: boolean;
};

export function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  onStepClick,
  isPreviousComplete,
}: PhaseCardProps) {
  const Icon = iconMap[phase.icon] || ClipboardList;
  const completedSteps = phase.steps.filter(
    (step) => step.progress?.completed,
  ).length;
  const totalSteps = phase.steps.length;
  const progressPercent =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isComplete = completedSteps === totalSteps && totalSteps > 0;
  const isActive = isPreviousComplete || phase.order_index === 1;

  return (
    <div
      className={`relative rounded-2xl border-2 transition-all duration-500 ${
        isComplete
          ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
          : isActive
            ? "border-slate-300 bg-white shadow-lg hover:shadow-xl"
            : "border-slate-200 bg-slate-50/50 opacity-70"
      }`}
    >
      {/* Progress bar behind the card */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 transition-all duration-700 ease-out"
          style={{
            background: `linear-gradient(90deg, ${phase.color}15 0%, ${phase.color}05 ${progressPercent}%, transparent ${progressPercent}%)`,
          }}
        />
      </div>

      {/* Header */}
      <button
        onClick={onToggle}
        className="relative w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 rounded-2xl"
      >
        <div className="flex items-start gap-4">
          {/* Phase number and icon */}
          <div
            className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all duration-500 ${
              isComplete
                ? "bg-emerald-500 text-white"
                : isActive
                  ? "bg-gradient-to-br text-white shadow-lg"
                  : "bg-slate-200 text-slate-400"
            }`}
            style={
              !isComplete && isActive
                ? {
                    backgroundImage: `linear-gradient(135deg, ${phase.color}, ${phase.color}dd)`,
                  }
                : undefined
            }
          >
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
            {isComplete && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            {!isActive && (
              <div className="absolute inset-0 bg-slate-300/50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
            )}
          </div>

          {/* Phase info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span
                className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                  isComplete
                    ? "bg-emerald-100 text-emerald-700"
                    : isActive
                      ? "bg-slate-100 text-slate-600"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                Phase {phase.order_index}
              </span>
              {isComplete && (
                <span className="text-sm font-medium text-emerald-600">
                  Complete
                </span>
              )}
            </div>
            <h3
              className={`text-base sm:text-xl font-bold mb-2 ${
                isActive ? "text-slate-800" : "text-slate-500"
              }`}
            >
              {phase.name}
            </h3>
            <p
              className={`text-sm ${
                isActive ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {phase.description}
            </p>

            {/* Progress indicator */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-700 ease-out rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: isComplete ? "#10B981" : phase.color,
                  }}
                />
              </div>
              <span
                className={`text-sm font-semibold ${
                  isComplete ? "text-emerald-600" : "text-slate-600"
                }`}
              >
                {completedSteps}/{totalSteps}
              </span>
            </div>
          </div>

          {/* Expand arrow */}
          <ChevronRight
            className={`w-6 h-6 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Steps list */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 space-y-3">
          <div className="h-px bg-slate-200 mb-4" />
          {phase.steps.map((step, index) => {
            const isStepComplete = step.progress?.completed;
            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.id)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${
                  isStepComplete
                    ? "bg-emerald-50 border border-emerald-200 hover:border-emerald-400"
                    : isActive
                      ? "bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md"
                      : "bg-slate-50 border border-slate-100 cursor-not-allowed"
                }`}
                disabled={!isActive}
              >
                {/* Step number */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                    isStepComplete
                      ? "bg-emerald-500 text-white"
                      : isActive
                        ? "bg-slate-100 text-slate-600"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Step info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-semibold text-sm sm:text-base break-words ${
                      isStepComplete
                        ? "text-emerald-700"
                        : isActive
                          ? "text-slate-800"
                          : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-sm truncate ${
                      isActive ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Status indicator */}
                {isStepComplete && (
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
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
