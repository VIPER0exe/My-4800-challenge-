import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Dumbbell, Clock, Flame, Info, Check, Sparkles, RefreshCcw } from 'lucide-react';
import Header from './components/Header';
import PushupTracker from './components/PushupTracker';
import PlankTracker from './components/PlankTracker';
import HistoryLogs from './components/HistoryLogs';
import { PushupState, PlankState, HistoryLog } from './types';

export default function App() {
  // --- Persistent States from LocalStorage ---
  const [pushupState, setPushupState] = useState<PushupState>(() => {
    try {
      const saved = localStorage.getItem('pushup_tracker_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading pushup state', e);
    }
    return { current: 4800, initial: 4800 };
  });

  const [plankState, setPlankState] = useState<PlankState>(() => {
    try {
      const saved = localStorage.getItem('plank_tracker_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading plank state', e);
    }
    // 48 hours = 48 * 3600 = 172,800 seconds
    return { currentSeconds: 172800, initialSeconds: 172800 };
  });

  const [logs, setLogs] = useState<HistoryLog[]>(() => {
    try {
      const saved = localStorage.getItem('workout_history_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading history logs', e);
    }
    return [];
  });

  // --- Sync with localStorage ---
  useEffect(() => {
    localStorage.setItem('pushup_tracker_state', JSON.stringify(pushupState));
  }, [pushupState]);

  useEffect(() => {
    localStorage.setItem('plank_tracker_state', JSON.stringify(plankState));
  }, [plankState]);

  useEffect(() => {
    localStorage.setItem('workout_history_logs', JSON.stringify(logs));
  }, [logs]);

  // --- Action Handlers ---

  // Handle pushup deductions/adjustments
  const handlePushupUpdate = (newState: PushupState, isAdd: boolean, amountChanged: number, notes?: string) => {
    setPushupState(newState);

    if (amountChanged > 0) {
      const newLog: HistoryLog = {
        id: crypto.randomUUID(),
        type: 'pushup',
        amount: amountChanged,
        timestamp: new Date().toISOString(),
        notes: notes || (isAdd ? `Added back ${amountChanged} reps` : `Deducted ${amountChanged} reps`),
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const handlePushupReset = (newInitial: number) => {
    setPushupState({
      initial: newInitial,
      current: newInitial,
    });
    const newLog: HistoryLog = {
      id: crypto.randomUUID(),
      type: 'pushup',
      amount: 0,
      timestamp: new Date().toISOString(),
      notes: `Reset pushup counter target to brand new ${newInitial} reps`,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handle plank timer deductions/adjustments
  const handlePlankUpdate = (newState: PlankState, isAdd: boolean, amountSecondsChanged: number, notes?: string) => {
    setPlankState(newState);

    if (amountSecondsChanged > 0) {
      const minutesPart = Math.floor(amountSecondsChanged / 60);
      const secondsPart = amountSecondsChanged % 60;
      const formattedDuration = minutesPart > 0 ? `${minutesPart}m ${secondsPart}s` : `${secondsPart}s`;

      const newLog: HistoryLog = {
        id: crypto.randomUUID(),
        type: 'plank',
        amount: amountSecondsChanged,
        timestamp: new Date().toISOString(),
        notes: notes || (isAdd ? `Added back ${formattedDuration}` : `Chipped off ${formattedDuration}`),
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const handlePlankReset = (newInitialSeconds: number) => {
    setPlankState({
      initialSeconds: newInitialSeconds,
      currentSeconds: newInitialSeconds,
    });
    const hoursVal = (newInitialSeconds / 3600).toFixed(1);
    const newLog: HistoryLog = {
      id: crypto.randomUUID(),
      type: 'plank',
      amount: 0,
      timestamp: new Date().toISOString(),
      notes: `Reset plank balance pool target to ${hoursVal}h`,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Revert / Delete specific session logs
  const handleDeleteLog = (id: string) => {
    const logToDelete = logs.find((l) => l.id === id);
    if (!logToDelete) return;

    if (logToDelete.type === 'pushup') {
      // Revert pushup by adding back current
      setPushupState((prev) => ({
        ...prev,
        current: prev.current + logToDelete.amount,
      }));
    } else if (logToDelete.type === 'plank') {
      // Revert plank by adding back seconds
      setPlankState((prev) => ({
        ...prev,
        currentSeconds: prev.currentSeconds + logToDelete.amount,
      }));
    }

    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleClearAllHistory = () => {
    // Reset counters to their initial values when logs are cleared
    setPushupState((prev) => ({ ...prev, current: prev.initial }));
    setPlankState((prev) => ({ ...prev, currentSeconds: prev.initialSeconds }));
    setLogs([]);
  };

  // Overall workout score math
  const initialTotalPushups = pushupState.initial;
  const completedPushups = Math.max(0, initialTotalPushups - pushupState.current);
  const initialTotalPlankSeconds = plankState.initialSeconds;
  const completedPlankSeconds = Math.max(0, initialTotalPlankSeconds - plankState.currentSeconds);

  const overallProgress =
    initialTotalPushups + initialTotalPlankSeconds > 0
      ? ((completedPushups + completedPlankSeconds) / (initialTotalPushups + initialTotalPlankSeconds)) * 100
      : 0;

  const isAllComplete = pushupState.current === 0 && plankState.currentSeconds === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-all selection:bg-sky-500/30 selection:text-sky-200">
      {/* Visual background ambient details */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-slate-950">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <Header totalLogCount={logs.filter((l) => l.amount > 0).length} />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Info card & Motivating message */}
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-start gap-3.5 shadow-md">
          <div className="p-2 bg-slate-800 text-sky-400 rounded-lg">
            <Info className="h-4 w-4" id="info-tip-icon" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">How this works</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Chip off reps or minutes of planks as you finish them! Logs can be deleted below to safely revert values if you mis-logged. All progress is persisted locally in your browser automatically—so you can safely close and revisit!
            </p>
          </div>
        </div>

        {/* Global summary card */}
        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-6 opacity-5 select-none pointer-events-none">
            <Trophy className="h-24 w-24 text-white" id="summary-trophy-large" />
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-extrabold text-sky-400 tracking-widest uppercase">Overview Metrics</span>
              <h3 className="text-xl font-bold text-slate-100 mt-1 tracking-tight flex items-center gap-2">
                Your Cumulative Progress
                {isAllComplete && (
                  <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Sparkles className="h-3 w-3" id="trophy-spark" /> Completed
                  </span>
                )}
              </h3>
            </div>
            <div className="text-right font-mono text-2xl font-bold text-indigo-300">
              {overallProgress.toFixed(1)}% <span className="text-[11px] font-sans font-medium text-slate-500">done</span>
            </div>
          </div>

          <div className="mt-4 h-2.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden p-[2px]">
            <motion.div
              layout
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 border-t border-slate-850/80">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Done Pushups</span>
              <p className="text-sm font-bold text-slate-200 font-mono mt-0.5">{completedPushups} <span className="text-xs text-slate-500 font-sans">/ {pushupState.initial}</span></p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Plank Elapsed</span>
              <p className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                {Math.floor(completedPlankSeconds / 3600)}h {Math.floor((completedPlankSeconds % 3600) / 60)}m
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Pushups Remaining</span>
              <p className="text-sm font-bold text-sky-400 font-mono mt-0.5">{pushupState.current}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Plank Remaining</span>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                {Math.floor(plankState.currentSeconds / 3600)}h {Math.floor((plankState.currentSeconds % 3600) / 60)}m
              </p>
            </div>
          </div>
        </div>

        {/* Dual Primary bento grid cols */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="h-full">
            <PushupTracker
              state={pushupState}
              onUpdate={handlePushupUpdate}
              onReset={handlePushupReset}
            />
          </div>
          <div className="h-full">
            <PlankTracker
              state={plankState}
              onUpdate={handlePlankUpdate}
              onReset={handlePlankReset}
            />
          </div>
        </div>

        {/* Audit/History Grid segment */}
        <div className="pt-4">
          <HistoryLogs
            logs={logs}
            onDeleteLog={handleDeleteLog}
            onClearAll={handleClearAllHistory}
          />
        </div>
      </main>

      <footer className="py-8 bg-slate-950 text-center text-xs text-slate-600 border-t border-slate-900 mt-12">
        <p className="flex items-center justify-center gap-1">
          Stay consistant. No resets. Persisted Locally.
        </p>
      </footer>
    </div>
  );
}
