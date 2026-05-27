import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, RefreshCw, Trophy, Flame, ChevronRight, CornerDownLeft } from 'lucide-react';
import { PushupState, HistoryLog } from '../types';

interface PushupTrackerProps {
  state: PushupState;
  onUpdate: (newState: PushupState, isAdd: boolean, amount: number, notes?: string) => void;
  onReset: (newInitial: number) => void;
}

export default function PushupTracker({ state, onUpdate, onReset }: PushupTrackerProps) {
  const [customInput, setCustomInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [configValue, setConfigValue] = useState<string>('4800');
  const [recentDeduction, setRecentDeduction] = useState<number | null>(null);

  const completed = Math.max(0, state.initial - state.current);
  const percentage = state.initial > 0 ? Math.min(100, (completed / state.initial) * 100) : 0;

  const handleDeduct = (amount: number, customNote?: string) => {
    if (amount <= 0 || isNaN(amount)) return;
    const finalAmount = Math.min(amount, state.current);
    if (finalAmount <= 0) return;

    const updatedState: PushupState = {
      ...state,
      current: Math.max(0, state.current - finalAmount),
    };

    onUpdate(updatedState, false, finalAmount, customNote || notes || undefined);
    setRecentDeduction(finalAmount);
    setTimeout(() => setRecentDeduction(null), 1000);
    setCustomInput('');
    setNotes('');
  };

  const handleManualAdd = (amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;
    const updatedState: PushupState = {
      ...state,
      current: state.current + amount,
    };
    onUpdate(updatedState, true, amount, 'Manual adjustment (added back)');
    setCustomInput('');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(configValue, 10);
    if (!isNaN(val) && val > 0) {
      onReset(val);
      setShowConfig(false);
    }
  };

  const quickDeductPresets = [5, 10, 20, 25, 30, 50];

  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-3xl p-6 relative overflow-hidden shadow-lg backdrop-blur-sm flex flex-col justify-between h-full">
      {/* Visual background details */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl -z-10" />

      {/* Main Container */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
            </span>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Pushup Counter</h2>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-300 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <RefreshCw className="h-3 w-3" id="reset-pushup-icon" />
            <span>Target Setting</span>
          </button>
        </div>

        {/* Change Target Settings Drawer */}
        <AnimatePresence>
          {showConfig && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleReset}
              className="mb-6 p-4 bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden"
            >
              <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wide">Adjust Pushups Target</h3>
              <p className="text-xs text-slate-400 mb-3">Adjusting this resets your initial total but preserves logged history.</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={configValue}
                  onChange={(e) => setConfigValue(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  placeholder="e.g. 4800"
                  min="1"
                />
                <button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-4 py-1.5 rounded-xl text-xs transition"
                >
                  Apply & Reset
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Big Countdown Tracker Circle or Large text combo */}
        <div className="text-center py-6 relative">
          <AnimatePresence mode="popLayout">
            {recentDeduction !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -25, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute left-1/2 -translate-x-1/2 text-rose-400 font-mono font-bold text-lg pointer-events-none"
              >
                -{recentDeduction} Reps!
              </motion.div>
            )}
          </AnimatePresence>

          <div className="inline-block relative">
            <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest block mb-1">Reps Remaining</span>
            <div className="text-6xl md:text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-450 via-white to-sky-400 tracking-tighter tabular-nums drop-shadow-sm select-none">
              {state.current}
            </div>
            {state.current === 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-full border-2 border-slate-900 shadow-xl"
              >
                <Trophy className="h-5 w-5 text-white" id="pushup-trophy-done" />
              </motion.div>
            )}
          </div>

          {/* Goal subtext progress metrics */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div>
              <span className="text-slate-500 font-normal">Completed:</span>{' '}
              <span className="text-slate-200 font-mono font-bold">{completed}</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-700" />
            <div>
              <span className="text-slate-500 font-normal">Initial Target:</span>{' '}
              <span className="text-slate-200 font-mono">{state.initial}</span>
            </div>
          </div>
        </div>

        {/* Gorgeous Linear Progress Bar */}
        <div className="space-y-1.5 mb-8">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Overall Progress</span>
            <span className="text-sky-400 font-bold font-mono">{percentage.toFixed(1)}%</span>
          </div>
          <div className="h-3.5 bg-slate-900/60 rounded-full border border-slate-800 p-[3px] overflow-hidden">
            <motion.div
              layout
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${
                state.current === 0
                  ? 'from-emerald-500 to-teal-400'
                  : 'from-sky-500 via-sky-400 to-sky-300'
              }`}
            />
          </div>
        </div>

        {/* Deduction Panels */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Quick Chip Options</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickDeductPresets.map((preset) => (
                <button
                  key={preset}
                  disabled={state.current === 0}
                  onClick={() => handleDeduct(preset, `Chipped off ${preset} reps`)}
                  className="bg-slate-900 hover:bg-slate-700/60 border border-slate-700/50 hover:border-sky-500/30 text-white font-mono text-xs font-semibold py-2.5 px-2 rounded-xl transition duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex flex-col items-center justify-center gap-0.5 focus:outline-none"
                >
                  <span className="text-sky-400 font-bold">-{preset}</span>
                  <span className="text-[8px] text-slate-500 font-sans tracking-wide">REPS</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700/40 pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Custom Entry Log</span>
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-700/50 space-y-2.5">
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Number of pushups"
                  min="1"
                  className="bg-slate-950 text-slate-100 placeholder-slate-550 border border-slate-800 rounded-xl py-2 px-3 pl-3 pr-16 text-xs w-full focus:outline-none focus:border-sky-500 font-mono transition"
                />
                <div className="absolute right-2 flex gap-1">
                  <button
                    onClick={() => handleManualAdd(parseInt(customInput, 10))}
                    disabled={!customInput}
                    title="Add back reps if adjusted by mistake"
                    className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-sky-400 rounded-lg border border-slate-700 hover:border-sky-500/30 transition disabled:opacity-20"
                  >
                    <Plus className="h-3 w-3" id="add-back-pushups" />
                  </button>
                  <button
                    onClick={() => handleDeduct(parseInt(customInput, 10))}
                    disabled={!customInput || state.current === 0}
                    className="p-1 px-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded-lg transition disabled:opacity-20 text-[10px] font-bold"
                  >
                    Deduct
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional logging comment (e.g. '3 sets of 15')"
                className="bg-slate-950/40 text-slate-200 placeholder-slate-600 border border-slate-800 rounded-xl py-1.5 px-3 text-[11px] w-full focus:outline-none focus:border-sky-400 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {state.current === 0 && (
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
          <p className="text-emerald-400 font-bold text-sm tracking-tight flex items-center justify-center gap-1.5">
            <Trophy className="h-4 w-4 fill-emerald-500/10" id="pushups-completed" /> All Pushups Completed! Outstanding grind.
          </p>
        </div>
      )}
    </div>
  );
}
