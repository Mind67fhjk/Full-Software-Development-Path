import { useState, useEffect } from 'react';
import { X, CheckCircle, Circle, Lightbulb, Save, Loader2 } from 'lucide-react';
import type { StepWithProgress } from '../lib/supabase';
import { supabase, getSessionId } from '../lib/supabase';

type StepDetailModalProps = {
  step: StepWithProgress;
  onClose: () => void;
  onUpdate: () => void;
};

export function StepDetailModal({
  step,
  onClose,
  onUpdate,
}: StepDetailModalProps) {
  const [completed, setCompleted] = useState(step.progress?.completed ?? false);
  const [notes, setNotes] = useState(step.progress?.notes ?? '');
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCompleted(step.progress?.completed ?? false);
    setNotes(step.progress?.notes ?? '');
  }, [step]);

  const handleToggleItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const handleSave = async () => {
    setSaving(true);
    const sessionId = getSessionId();
    try {
      const progressData = {
        completed,
        notes: notes.trim() || null,
        completed_at: completed ? new Date().toISOString() : null,
      };

      if (step.progress?.id) {
        await supabase
          .from('step_progress')
          .update(progressData)
          .eq('id', step.progress.id)
          .eq('session_id', sessionId);
      } else {
        await supabase.from('step_progress').insert({
          step_id: step.id,
          session_id: sessionId,
          ...progressData,
        });
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const itemsCompleted = checkedItems.size;
  const totalItems = step.details?.items?.length ?? 0;
  const allItemsChecked = itemsCompleted === totalItems && totalItems > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 sm:px-8 py-5 sm:py-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
              Step {step.order_index}
            </span>
            {completed && (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-sm font-medium">
                Complete
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{step.title}</h2>
          <p className="text-slate-300 mt-1">{step.description}</p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Checklist */}
          {step.details?.items && step.details.items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Checklist ({itemsCompleted}/{totalItems})
              </h3>
              <div className="space-y-2">
                {step.details.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleToggleItem(index)}
                    className={`w-full p-4 rounded-xl flex items-start gap-3 transition-all duration-200 text-left ${
                      checkedItems.has(index)
                        ? 'bg-emerald-50 border-2 border-emerald-300'
                        : 'bg-slate-50 border-2 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {checkedItems.has(index) ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        checkedItems.has(index)
                          ? 'text-emerald-700 line-through'
                          : 'text-slate-700'
                      }
                    >
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {step.details?.tips && step.details.tips.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Pro Tips
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <ul className="space-y-2">
                  {step.details.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-amber-800"
                    >
                      <span className="text-amber-500 mt-0.5">+</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Your Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your progress, learnings, or blockers..."
              className="w-full h-32 p-4 rounded-xl border-2 border-slate-200 focus:border-slate-400 focus:outline-none resize-none text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Completion toggle */}
          <div className="bg-slate-50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700">
                Mark this step as complete
              </span>
            </label>
            {allItemsChecked && !completed && (
              <p className="mt-2 text-sm text-emerald-600">
                You've checked all items - ready to complete!
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-4 sm:px-8 py-4 bg-slate-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-xl font-semibold hover:from-slate-700 hover:to-slate-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Progress
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
