import { Activity, Flame, Dumbbell } from 'lucide-react';

interface HeaderProps {
  totalLogCount: number;
}

export default function Header({ totalLogCount }: HeaderProps) {
  return (
    <header className="relative overflow-hidden bg-slate-900 border-b border-slate-800 py-6 px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_50%)]" />
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 shadow-md">
            <Dumbbell className="h-6 w-6" id="h-6_w-6_1" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Grind & Chip <span className="text-xs bg-sky-500/20 text-sky-300 font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">Workout Companion</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Persistent tracking companion for your custom workouts.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="bg-slate-800/40 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="p-1 px-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg flex items-center gap-1.5 text-xs font-semibold">
              <Flame className="h-4 w-4 fill-amber-500/10" id="h-4_w-4_1" />
              <span>ACTIVE JOURNEY</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-medium">Logged Sessions</p>
              <p className="text-sm font-bold text-white font-mono">{totalLogCount}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
