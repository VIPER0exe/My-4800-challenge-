import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Square, SkipForward, Hourglass, Settings, Plus, Flame, Sparkles, Check } from 'lucide-react';
import { PlankState } from '../types';

interface PlankTrackerProps {
  state: PlankState;
  onUpdate: (newState: PlankState, isAdd: boolean, amountSeconds: number, notes?: string) => void;
  onReset: (newInitialSeconds: number) => void;
}

export default function PlankTracker({ state, onUpdate, onReset }: PlankTrackerProps) {
  // Live stopwatch states
  const [isTiming, setIsTiming] = useState<boolean>(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Manual & Settings states
  const [manualMinutes, setManualMinutes] = useState<string>('');
  const [manualSeconds, setManualSeconds] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [configHours, setConfigHours] = useState<string>('48');
  const [successSparkle, setSuccessSparkle] = useState<boolean>(false);

  // Clean active stopwatch interval
  useEffect(() => {
    if (isTiming) {
      intervalRef.current = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTiming]);

  // Handle active stop-watch session finish & deduction
  const handleFinishStopwatchSession = () => {
    if (stopwatchSeconds === 0) return;
    setIsTiming(false);

    const actualDeduction = Math.min(stopwatchSeconds, state.currentSeconds);
    if (actualDeduction > 0) {
      const updatedState: PlankState = {
        ...state,
        currentSeconds: Math.max(0, state.currentSeconds - actualDeduction),
      };

      const m = Math.floor(actualDeduction / 60);
      const s = actualDeduction % 60;
      const noteStr = `Logged Live stopwatch plank of ${m > 0 ? `${m}m ` : ''}${s}s`;

      onUpdate(updatedState, false, actualDeduction, noteStr);
      setSuccessSparkle(true);
      setTimeout(() => setSuccessSparkle(false), 2000);
    }
    setStopwatchSeconds(0);
  };

  const handleCancelStopwatch = () => {
    setIsTiming(false);
    setStopwatchSeconds(0);
  };

  // Convert digital display metrics
  const formatTimeMetrics = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return {
      hours: String(hrs).padStart(2, '0'),
      minutes: String(mins).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
    };
  };

  const formatFriendlyDescriptor = (totalSecs: number) => {
    const days = Math.floor(totalSecs / 86400);
    const hrs = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const items: string[] = [];
    if (days > 0) items.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hrs > 0) items.push(`${hrs} hour${hrs > 1 ? 's' : ''}`);
    if (mins > 0) items.push(`${mins} min${mins > 1 ? 's' : ''}`);
    if (secs > 0 || items.length === 0) items.push(`${secs} sec${secs > 1 ? 's' : ''}`);
    return items.join(', ');
  };

  const currentFormatted = formatTimeMetrics(state.currentSeconds);
  const stopwatchFormatted = formatTimeMetrics(stopwatchSeconds);

  const completedSeconds = Math.max(0, state.initialSeconds - state.currentSeconds);
  const percentage = state.initialSeconds > 0 ? Math.min(100, (completedSeconds / state.initialSeconds) * 100) : 0;

  // Process manual interval deduction
  const handleManualDeduct = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = parseInt(manualMinutes || '0', 10);
    const secVal = parseInt(manualSeconds || '0', 10);
    const totalDeduct = minVal * 60 + secVal;

    if (totalDeduct <= 0 || isNaN(totalDeduct)) return;

    const finalDeduct = Math.min(totalDeduct, state.currentSeconds);
    if (finalDeduct <= 0) return;

    const updatedState: PlankState = {
      ...state,
      currentSeconds: Math.max(0, state.currentSeconds - finalDeduct),
    };

    const notes = manualNotes || `Deducted ${minVal > 0 ? `${minVal}m ` : ''}${secVal > 0 ? `${secVal}s ` : ''}manual plank`;
    onUpdate(updatedState, false, finalDeduct, notes);

    setManualMinutes('');
    setManualSeconds('');
    setManualNotes('');
    setSuccessSparkle(true);
    setTimeout(() => setSuccessSparkle(false), 2000);
  };

  // Add back time adjustment in case of typos
  const handleManualAddBack = () => {
    const minVal = parseInt(manualMinutes || '0', 10);
    const secVal = parseInt(manualSeconds || '0', 10);
    const totalAdd = minVal * 60 + secVal;

    if (totalAdd <= 0 || isNaN(totalAdd)) return;

    const updatedState: PlankState = {
      ...state,
      currentSeconds: state.currentSeconds + totalAdd,
    };

    onUpdate(updatedState, true, totalAdd, `Manual balance added back (${minVal > 0 ? `${minVal}m ` : ''}${secVal > 0 ? `${secVal}s` : ''})`);
    setManualMinutes('');
    setManualSeconds('');
  };

  // Preset subtractors
  const handlePresetSubtract = (seconds: number) => {
    const finalAmount = Math.min(seconds, state.currentSeconds);
    if (finalAmount <= 0) return;

    const updatedState: PlankState = {
      ...state,
      currentSeconds: Math.max(0, state.currentSeconds - finalAmount),
    };

    const m = Math.floor(finalAmount / 60);
    const s = finalAmount % 60;
    const noteStr = `Plank preset chunk of -${m > 0 ? `${m}m ` : ''}${s > 0 ? `${s}s` : ''}`;

    onUpdate(updatedState, false, finalAmount, noteStr);
    setSuccessSparkle(true);
    setTimeout(() => setSuccessSparkle(false), 1500);
  };

  const handleConfigReset = (e: React.FormEvent) => {
    e.preventDefault();
    const hrsVal = parseFloat(configHours);
    if (!isNaN(hrsVal) && hrsVal > 0) {
      const computedSecs = Math.round(hrsVal * 3600);
      onReset(computedSecs);
      setShowConfig(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-6 relative overflow-hidden shadow-lg backdrop-blur-sm flex flex-col justify-between h-full">
      {/* Visual top border design */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Plank Chip-Off Timer</h2>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-300 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <Settings className="h-3 w-3" id="config-plank-setting" />
            <span>Target Hours</span>
          </button>
        </div>

        {/* Change Target settings */}
        <AnimatePresence>
          {showConfig && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleConfigReset}
              className="mb-6 p-4 bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">Adjust Total Goal</h3>
              <p className="text-xs text-slate-400 mb-3">Adjusting this resets your initial total hours pool but preserves history logs.</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={configHours}
                  onChange={(e) => setConfigHours(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white w-full focus:outline-none font-mono"
                  placeholder="e.g. 48"
                  min="0.1"
                  step="any"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-1.5 rounded-xl text-xs transition whitespace-nowrap"
                >
                  Set & Reset
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Big Remaining Balance Display */}
        <div className="text-center py-5 relative">
          <AnimatePresence>
            {successSparkle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1.1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-1 right-6 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5"
              >
                <Sparkles className="h-3 w-3" id="success-spark" />
                <span>Time Deducted!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest block mb-1">Time Remaining</span>
          <div className="flex items-center justify-center gap-1 md:gap-2 select-none">
            <div className="font-mono text-4xl md:text-5xl font-bold bg-slate-900 border border-slate-800 text-white md:px-3 py-2 rounded-xl tabular-nums shadow-sm min-w-[56px] md:min-w-[68px]">
              {currentFormatted.hours}
              <div className="text-[10px] text-slate-500 uppercase mt-1 font-sans font-medium tracking-normal">Hrs</div>
            </div>
            <span className="text-xl font-bold text-slate-600 font-mono">:</span>
            <div className="font-mono text-4xl md:text-5xl font-bold bg-slate-900 border border-slate-800 text-white md:px-3 py-2 rounded-xl tabular-nums shadow-sm min-w-[56px] md:min-w-[68px]">
              {currentFormatted.minutes}
              <div className="text-[10px] text-slate-500 uppercase mt-1 font-sans font-medium tracking-normal">Min</div>
            </div>
            <span className="text-xl font-bold text-slate-600 font-mono">:</span>
            <div className="font-mono text-4xl md:text-5xl font-bold bg-slate-900 border border-slate-800 text-white md:px-3 py-2 rounded-xl tabular-nums shadow-sm min-w-[56px] md:min-w-[68px]">
              {currentFormatted.seconds}
              <div className="text-[10px] text-slate-500 uppercase mt-1 font-sans font-medium tracking-normal">Sec</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400 truncate max-w-xs mx-auto text-center font-medium">
            {formatFriendlyDescriptor(state.currentSeconds)}
          </div>
        </div>

        {/* Gorgeous Circular/Linear Progress Metrics */}
        <div className="space-y-1.5 mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Plank Completion Metric</span>
            <span className="text-emerald-400 font-bold font-mono">
              {formatTimeMetrics(completedSeconds).hours}h {formatTimeMetrics(completedSeconds).minutes}m completed ({percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="h-3.5 bg-slate-900/60 rounded-full border border-slate-800 p-[3px] overflow-hidden">
            <motion.div
              layout
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${
                state.currentSeconds === 0
                  ? 'from-emerald-500 to-teal-400'
                  : 'from-emerald-500 via-teal-400 to-cyan-300'
              }`}
            />
          </div>
        </div>

        {/* Stopwatch exercise system (ACTIVE TIMER) */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 mb-6">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest block mb-2">Plank Active timing stop-watch</span>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Workout Duration</span>
              <div className="font-mono text-3xl font-extrabold text-indigo-300 tabular-nums">
                {stopwatchFormatted.minutes}
                <span className="text-slate-500 font-normal">:</span>
                {stopwatchFormatted.seconds}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isTiming ? (
                <button
                  onClick={() => setIsTiming(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 active:scale-95 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-white" id="stopwatch-play" />
                  <span>Start Plank</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsTiming(false)}
                  className="bg-amber-650 hover:bg-amber-600 text-white font-medium px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95 transition"
                >
                  <Pause className="h-3.5 w-3.5 fill-white" id="stopwatch-pause" />
                  <span>Pause</span>
                </button>
              )}

              {stopwatchSeconds > 0 && (
                <div className="flex gap-1.5">
                  <button
                    onClick={handleFinishStopwatchSession}
                    disabled={state.currentSeconds === 0}
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition disabled:opacity-40"
                  >
                    <Check className="h-3.5 w-3.5" id="stopwatch-complete" />
                    <span>Deduct & Log</span>
                  </button>
                  <button
                    onClick={handleCancelStopwatch}
                    type="button"
                    title="Cancel stopwatch"
                    className="p-2 bg-slate-850 hover:bg-slate-750 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl transition"
                  >
                    <Square className="h-3.5 w-3.5" id="stopwatch-clear" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Presets and manual deduct */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Preset Plank Chippers</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '30s', secs: 30 },
                { label: '1m', secs: 60 },
                { label: '2m', secs: 120 },
                { label: '5m', secs: 300 },
              ].map((item) => (
                <button
                  key={item.secs}
                  disabled={state.currentSeconds === 0}
                  onClick={() => handlePresetSubtract(item.secs)}
                  className="bg-slate-900 hover:bg-slate-700/60 border border-slate-700/50 hover:border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold py-2 px-1.5 rounded-xl transition active:scale-95 disabled:opacity-30 flex flex-col items-center justify-center gap-0.5 focus:outline-none"
                >
                  <span>-{item.label}</span>
                  <span className="text-[8px] text-slate-500 font-sans font-medium tracking-wide">PLANK</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700/40 pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Manual Duration Chip-Off</span>
            <form onSubmit={handleManualDeduct} className="bg-slate-950/60 p-3 rounded-2xl border border-slate-700/50 space-y-2.5">
              <div className="flex gap-2">
                <div className="w-1/2">
                  <span className="text-[8px] text-slate-500 block uppercase mb-1 font-bold">Minutes</span>
                  <input
                    type="number"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value)}
                    placeholder="Min"
                    min="0"
                    className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs w-full focus:outline-none focus:border-emerald-500 font-mono text-center"
                  />
                </div>
                <div className="w-1/2">
                  <span className="text-[8px] text-slate-500 block uppercase mb-1 font-bold">Seconds</span>
                  <input
                    type="number"
                    value={manualSeconds}
                    onChange={(e) => setManualSeconds(e.target.value)}
                    placeholder="Sec"
                    min="0"
                    max="59"
                    className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs w-full focus:outline-none focus:border-emerald-500 font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Notes (e.g. 'Weighted plank')"
                  className="bg-slate-950/45 text-slate-200 placeholder-slate-600 border border-slate-800 rounded-xl py-1.5 px-3 text-[11px] w-full focus:outline-none focus:border-emerald-400 transition"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleManualAddBack}
                    disabled={!manualMinutes && !manualSeconds}
                    title="Add back time if logged by mistake"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700 rounded-xl transition disabled:opacity-20"
                  >
                    <Plus className="h-3.5 w-3.5" id="plank-add-plus" />
                  </button>
                  <button
                    type="submit"
                    disabled={(!manualMinutes && !manualSeconds) || state.currentSeconds === 0}
                    className="p-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-25"
                  >
                    Deduct
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {state.currentSeconds === 0 && (
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
          <p className="text-emerald-400 font-bold text-sm tracking-tight flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4" id="plank-done" /> All 48h Plank Goal Completed! Insane persistence!
          </p>
        </div>
      )}
    </div>
  );
}
