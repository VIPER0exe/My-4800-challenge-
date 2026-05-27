import { Activity, Dumbbell, Clock, Trash2, Calendar, FileText, ChevronDown } from 'lucide-react';
import { HistoryLog } from '../types';

interface HistoryLogsProps {
  logs: HistoryLog[];
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryLogs({ logs, onDeleteLog, onClearAll }: HistoryLogsProps) {
  // Format plank time nicely
  const formatSecondsToLabel = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins > 0) {
      return `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
    }
    return `${secs}s`;
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-sky-400" id="hist-activity-icon" />
            <span>Workout Logs</span>
          </h2>
          <p className="text-xs text-slate-400">History of your pushup counts and plank timing deductions.</p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all history? This will reset custom logged balances too!')) {
                onClearAll();
              }
            }}
            className="text-xs bg-slate-900/60 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/20 px-3.5 py-2 rounded-xl transition font-medium focus:outline-none focus:ring-1 focus:ring-rose-500/20"
          >
            Clear All History
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-900/20 border border-dashed border-slate-700/60 rounded-2xl">
          <Calendar className="h-8 w-8 text-slate-600 mx-auto mb-3" id="hist-calendar-empty" />
          <p className="text-sm font-semibold text-slate-400">No workout records logged yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Your exercises will appear here chronologically as you shave them off.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-800 bg-slate-900/40 rounded-2xl">
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-800/80 custom-scrollbar">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-850/40 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl border flex-shrink-0 ${
                      log.type === 'pushup'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {log.type === 'pushup' ? (
                      <Dumbbell className="h-4 w-4" id={`pushup-log-icon-${log.id}`} />
                    ) : (
                      <Clock className="h-4 w-4" id={`plank-log-icon-${log.id}`} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span>
                        {log.type === 'pushup' ? 'Pushups Deducted' : 'Plank Chipped'}
                      </span>
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded-md font-bold ${
                          log.type === 'pushup'
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {log.type === 'pushup' ? `-${log.amount} reps` : `-${formatSecondsToLabel(log.amount)}`}
                      </span>
                    </p>

                    {log.notes && (
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                        <FileText className="h-3 w-3 text-slate-500 flex-shrink-0" id={`note-icon-${log.id}`} />
                        <span>{log.notes}</span>
                      </p>
                    )}

                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <span>Logged:</span>
                      <span className="font-medium text-slate-400">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteLog(log.id)}
                  title="Delete log (reverts deducted amount)"
                  className="p-2 text-slate-500 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95 focus:outline-none"
                >
                  <Trash2 className="h-4 w-4" id={`delete-log-${log.id}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
