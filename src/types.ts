export type ActivityType = 'pushup' | 'plank';

export interface PushupState {
  current: number;
  initial: number;
}

export interface PlankState {
  currentSeconds: number; // starts at 48h (172800s)
  initialSeconds: number; // 172800s
}

export interface HistoryLog {
  id: string;
  type: ActivityType;
  amount: number; // count for pushup, seconds for plank
  timestamp: string; // ISO string or human formatted date
  notes?: string;
}

export interface DashboardStats {
  pushupCompletionRate: number;
  plankCompletionRate: number;
  pushupCompleted: number;
  plankCompletedSeconds: number;
}
