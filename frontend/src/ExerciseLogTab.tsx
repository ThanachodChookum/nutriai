// frontend/src/components/ExerciseLogTab.tsx (ฉบับเต็มที่รวม Smartwatch)
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame, Timer, Heart, Activity, TrendingUp, Dumbbell,
  Watch, RefreshCw, Wifi, WifiOff, Loader2, Trash2,
  ChevronRight, Footprints, Moon, Zap, Wind, Scale
} from 'lucide-react';
import { SmartwatchConnection } from './SmartwatchConnection';

interface ExerciseEntry {
  id: string;
  name: string;
  type: string;
  duration: number;
  calories: number;
  sets?: number;
  reps?: number;
  time: string;
  avgHeartRate?: number;
  peakHeartRate?: number;
  distance?: number;
  pace?: string;
  hrZones?: HRZones;
  source?: 'watch' | 'manual';
}
interface ExerciseLogTabProps {
  userId: string;
  onHeartRateUpdate?: (hr: number) => void;
}

interface HRZones {
  zone1: number;
  zone2: number;
  zone3: number;
  zone4: number;
}

interface WatchMetrics {
  caloriesBurned: number;
  caloriesGoal: number;
  avgHeartRate: number;
  peakHeartRate: number;
  steps: number;
  stepsGoal: number;
  sleepHours: number;
  sleepRem: number;
  exerciseMinutes: number;
  exerciseGoal: number;
  standHours: number;
  standGoal: number;
  hrZones: HRZones;
}

interface ExerciseLogTabProps {
  userId: string;
}

const MOCK_DATA: Record<string, { metrics: WatchMetrics; activities: Omit<ExerciseEntry, 'id'>[] }> = {
  apple_watch: {
    metrics: {
      caloriesBurned: 486, caloriesGoal: 600,
      avgHeartRate: 134, peakHeartRate: 168,
      steps: 8412, stepsGoal: 10000,
      sleepHours: 6.8, sleepRem: 1.4,
      exerciseMinutes: 55, exerciseGoal: 60,
      standHours: 9, standGoal: 12,
      hrZones: { zone1: 12, zone2: 28, zone3: 38, zone4: 22 },
    },
    activities: [
      { name: 'Morning Run', type: 'Running', duration: 38, calories: 310, time: '07:22',
        avgHeartRate: 142, peakHeartRate: 168, distance: 5.2, pace: "7'18\"/km",
        hrZones: { zone1: 5, zone2: 20, zone3: 45, zone4: 30 }, source: 'watch' },
      { name: 'Upper Body Strength', type: 'Strength', duration: 28, calories: 176, time: '19:05',
        avgHeartRate: 118, peakHeartRate: 148,
        hrZones: { zone1: 20, zone2: 45, zone3: 25, zone4: 10 }, source: 'watch' },
    ],
  },
  garmin: {
    metrics: {
      caloriesBurned: 612, caloriesGoal: 700,
      avgHeartRate: 128, peakHeartRate: 172,
      steps: 10241, stepsGoal: 10000,
      sleepHours: 7.2, sleepRem: 1.8,
      exerciseMinutes: 72, exerciseGoal: 60,
      standHours: 11, standGoal: 12,
      hrZones: { zone1: 8, zone2: 22, zone3: 42, zone4: 28 },
    },
    activities: [
      { name: 'Cycling', type: 'Cycling', duration: 52, calories: 420, time: '06:45',
        avgHeartRate: 138, peakHeartRate: 172, distance: 22.4, pace: "2'19\"/km",
        hrZones: { zone1: 8, zone2: 22, zone3: 42, zone4: 28 }, source: 'watch' },
      { name: 'Yoga Flow', type: 'Yoga', duration: 20, calories: 92, time: '20:00',
        avgHeartRate: 92, peakHeartRate: 110,
        hrZones: { zone1: 60, zone2: 30, zone3: 10, zone4: 0 }, source: 'watch' },
    ],
  },
  samsung: {
    metrics: {
      caloriesBurned: 380, caloriesGoal: 500,
      avgHeartRate: 122, peakHeartRate: 155,
      steps: 6820, stepsGoal: 8000,
      sleepHours: 7.5, sleepRem: 2.1,
      exerciseMinutes: 40, exerciseGoal: 45,
      standHours: 8, standGoal: 12,
      hrZones: { zone1: 18, zone2: 35, zone3: 32, zone4: 15 },
    },
    activities: [
      { name: 'HIIT Training', type: 'HIIT', duration: 25, calories: 280, time: '18:30',
        avgHeartRate: 148, peakHeartRate: 155,
        hrZones: { zone1: 5, zone2: 15, zone3: 38, zone4: 42 }, source: 'watch' },
      { name: 'Evening Walk', type: 'Cardio', duration: 15, calories: 100, time: '20:15',
        avgHeartRate: 98, peakHeartRate: 112, distance: 1.8, pace: "8'20\"/km",
        hrZones: { zone1: 45, zone2: 40, zone3: 15, zone4: 0 }, source: 'watch' },
    ],
  },
  fitbit: {
    metrics: {
      caloriesBurned: 520, caloriesGoal: 550,
      avgHeartRate: 118, peakHeartRate: 162,
      steps: 9870, stepsGoal: 10000,
      sleepHours: 8.1, sleepRem: 1.9,
      exerciseMinutes: 65, exerciseGoal: 60,
      standHours: 10, standGoal: 12,
      hrZones: { zone1: 15, zone2: 38, zone3: 30, zone4: 17 },
    },
    activities: [
      { name: 'Swim Training', type: 'Swimming', duration: 45, calories: 380, time: '07:00',
        avgHeartRate: 128, peakHeartRate: 162, distance: 1.5,
        hrZones: { zone1: 10, zone2: 35, zone3: 38, zone4: 17 }, source: 'watch' },
      { name: 'Stretching', type: 'Yoga', duration: 20, calories: 60, time: '21:00',
        avgHeartRate: 88, peakHeartRate: 100,
        hrZones: { zone1: 80, zone2: 18, zone3: 2, zone4: 0 }, source: 'watch' },
    ],
  },
  mi_band: {
    metrics: {
      caloriesBurned: 310, caloriesGoal: 450,
      avgHeartRate: 110, peakHeartRate: 148,
      steps: 7230, stepsGoal: 8000,
      sleepHours: 6.2, sleepRem: 1.1,
      exerciseMinutes: 35, exerciseGoal: 45,
      standHours: 7, standGoal: 12,
      hrZones: { zone1: 22, zone2: 42, zone3: 26, zone4: 10 },
    },
    activities: [
      { name: 'Running', type: 'Running', duration: 35, calories: 310, time: '06:30',
        avgHeartRate: 138, peakHeartRate: 148, distance: 4.8, pace: "7'17\"/km",
        hrZones: { zone1: 8, zone2: 30, zone3: 42, zone4: 20 }, source: 'watch' },
    ],
  },
};

function ActivityRings({ metrics }: { metrics: WatchMetrics }) {
  const movePercent = Math.min((metrics.caloriesBurned / metrics.caloriesGoal) * 100, 100);
  const exPercent   = Math.min((metrics.exerciseMinutes / metrics.exerciseGoal) * 100, 100);
  const standPercent = Math.min((metrics.standHours / metrics.standGoal) * 100, 100);

  const circumference = (r: number) => 2 * Math.PI * r;
  const offset = (r: number, pct: number) => circumference(r) * (1 - pct / 100);

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
        <Activity className="size-4 text-primary" /> Activity Rings
      </h4>
      <div className="flex items-center gap-6 flex-wrap">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-700" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="10"
            strokeDasharray={circumference(50)} strokeDashoffset={offset(50, standPercent)}
            strokeLinecap="round" transform="rotate(-90 60 60)" />
          <circle cx="60" cy="60" r="38" fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-700" />
          <circle cx="60" cy="60" r="38" fill="none" stroke="#22c55e" strokeWidth="10"
            strokeDasharray={circumference(38)} strokeDashoffset={offset(38, exPercent)}
            strokeLinecap="round" transform="rotate(-90 60 60)" />
          <circle cx="60" cy="60" r="26" fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:stroke-slate-700" />
          <circle cx="60" cy="60" r="26" fill="none" stroke="#ef4444" strokeWidth="10"
            strokeDasharray={circumference(26)} strokeDashoffset={offset(26, movePercent)}
            strokeLinecap="round" transform="rotate(-90 60 60)" />
          <text x="60" y="56" textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor" className="fill-slate-700 dark:fill-slate-200">
            {Math.round(movePercent)}%
          </text>
          <text x="60" y="68" textAnchor="middle" fontSize="9" fill="currentColor" className="fill-slate-400">
            Move
          </text>
        </svg>
        <div className="space-y-3 flex-1 min-w-[160px]">
          {[
            { label: 'Move', value: `${metrics.caloriesBurned} / ${metrics.caloriesGoal} kcal`, color: 'bg-red-500' },
            { label: 'Exercise', value: `${metrics.exerciseMinutes} / ${metrics.exerciseGoal} min`, color: 'bg-green-500' },
            { label: 'Stand', value: `${metrics.standHours} / ${metrics.standGoal} hr`, color: 'bg-blue-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`size-2.5 rounded-full ${color} shrink-0`} />
              <span className="text-sm text-slate-600 dark:text-slate-400 w-16">{label}</span>
              <span className="text-sm font-bold">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HRZoneBar({ zones }: { zones: HRZones }) {
  const items = [
    { label: 'Zone 1', name: 'Rest',     pct: zones.zone1, color: 'bg-blue-400',   pill: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Zone 2', name: 'Fat burn', pct: zones.zone2, color: 'bg-green-400',  pill: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    { label: 'Zone 3', name: 'Cardio',   pct: zones.zone3, color: 'bg-yellow-400', pill: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    { label: 'Zone 4', name: 'Peak',     pct: zones.zone4, color: 'bg-red-400',    pill: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  ];
  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
        <Heart className="size-4 text-red-500" /> Heart Rate Zones
      </h4>
      <div className="space-y-3">
        {items.map(({ label, name, pct, color, pill }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-12 shrink-0">{label}</span>
            <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={`h-full ${color} rounded-full`}
              />
            </div>
            <span className="text-xs text-slate-500 w-8 text-right shrink-0">{pct}%</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pill} shrink-0 w-16 text-center`}>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutCard({ ex, onDelete, userId }: { ex: ExerciseEntry; onDelete: (id: string) => void; userId: string }) {
  const [expanded, setExpanded] = useState(false);

  const typeConfig: Record<string, { bg: string; emoji: string; badge: string }> = {
    Running:   { bg: 'bg-green-100 dark:bg-green-900/30',  emoji: '🏃', badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    Strength:  { bg: 'bg-blue-100 dark:bg-blue-900/30',   emoji: '🏋️', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    Yoga:      { bg: 'bg-purple-100 dark:bg-purple-900/30', emoji: '🧘', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    Cycling:   { bg: 'bg-yellow-100 dark:bg-yellow-900/30', emoji: '🚴', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
    HIIT:      { bg: 'bg-orange-100 dark:bg-orange-900/30', emoji: '⚡', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    Swimming:  { bg: 'bg-cyan-100 dark:bg-cyan-900/30',   emoji: '🏊', badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
    Cardio:    { bg: 'bg-red-100 dark:bg-red-900/30',     emoji: '🏃', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  };
  const cfg = typeConfig[ex.type] ?? { bg: 'bg-slate-100 dark:bg-slate-700', emoji: '💪', badge: 'bg-slate-100 text-slate-700' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden group"
    >
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className={`size-12 rounded-xl ${cfg.bg} flex items-center justify-center text-xl shrink-0`}>
          {cfg.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm truncate">{ex.name}</p>
            {ex.source === 'watch' && (
              <Watch className="size-3 text-primary shrink-0" />
            )}
          </div>
          <div className="flex gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
            <span className="flex items-center gap-1"><Timer className="size-3" />{ex.duration} min</span>
            <span className="flex items-center gap-1 text-red-400 font-bold"><Flame className="size-3" />{ex.calories} kcal</span>
            {ex.avgHeartRate && <span className="flex items-center gap-1"><Heart className="size-3 text-pink-400" />{ex.avgHeartRate} bpm</span>}
            {ex.distance && <span>{ex.distance} km</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">{ex.time}</span>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${cfg.badge}`}>{ex.type}</span>
          <ChevronRight className={`size-4 text-slate-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          {userId !== 'demo' && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(ex.id); }}
              className="size-7 rounded-lg bg-red-50 text-red-400 items-center justify-center hidden group-hover:flex hover:bg-red-100"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {ex.peakHeartRate && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 mb-1">Peak HR</p>
                    <p className="font-black text-red-500 text-lg">{ex.peakHeartRate}<span className="text-xs font-normal"> bpm</span></p>
                  </div>
                )}
                {ex.pace && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 mb-1">Pace</p>
                    <p className="font-black text-blue-600 text-lg">{ex.pace}</p>
                  </div>
                )}
                {ex.distance && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 mb-1">Distance</p>
                    <p className="font-black text-green-600 text-lg">{ex.distance}<span className="text-xs font-normal"> km</span></p>
                  </div>
                )}
                {ex.sets && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 mb-1">Sets × Reps</p>
                    <p className="font-black text-purple-600 text-lg">{ex.sets}×{ex.reps}</p>
                  </div>
                )}
              </div>
              {ex.hrZones && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">HR Zone breakdown</p>
                  <div className="flex gap-1 h-6 rounded-lg overflow-hidden">
                    {[
                      { pct: ex.hrZones.zone1, color: 'bg-blue-400' },
                      { pct: ex.hrZones.zone2, color: 'bg-green-400' },
                      { pct: ex.hrZones.zone3, color: 'bg-yellow-400' },
                      { pct: ex.hrZones.zone4, color: 'bg-red-400' },
                    ].map((z, i) => (
                      z.pct > 0 && (
                        <div key={i} className={`${z.color} flex items-center justify-center text-[9px] font-bold text-white`} style={{ width: `${z.pct}%` }}>
                          {z.pct >= 10 ? `${z.pct}%` : ''}
                        </div>
                      )
                    ))}
                  </div>
                  <div className="flex gap-4 mt-1.5">
                    {[
                      { label: 'Rest', color: 'bg-blue-400', pct: ex.hrZones.zone1 },
                      { label: 'Fat burn', color: 'bg-green-400', pct: ex.hrZones.zone2 },
                      { label: 'Cardio', color: 'bg-yellow-400', pct: ex.hrZones.zone3 },
                      { label: 'Peak', color: 'bg-red-400', pct: ex.hrZones.zone4 },
                    ].map(z => (
                      <div key={z.label} className="flex items-center gap-1">
                        <div className={`size-1.5 rounded-full ${z.color}`} />
                        <span className="text-[10px] text-slate-400">{z.label} {z.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ExerciseLogTab({ userId, onHeartRateUpdate }: ExerciseLogTabProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>('apple_watch');
  const [connected, setConnected] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [metrics, setMetrics] = useState<WatchMetrics>(MOCK_DATA.apple_watch.metrics);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [watchHeartRate, setWatchHeartRate] = useState<number | null>(null);

  const fetchExercises = useCallback(async () => {
    if (!userId || userId === 'demo') {
      const mockActivities = MOCK_DATA[selectedDevice].activities.map((a, i) => ({
        ...a,
        id: `${selectedDevice}_${i}`,
      }));
      setExercises(mockActivities);
      return;
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/exercises?userId=${userId}&date=${today}`);
      const data = await res.json();
      if (data.exercises?.length > 0) {
        setExercises(data.exercises.map((e: any) => ({
          id: e._id, name: e.name, type: e.type,
          duration: e.duration, calories: e.calories,
          sets: e.sets, reps: e.reps, time: e.time,
          avgHeartRate: e.avgHeartRate,
          peakHeartRate: e.peakHeartRate,
          distance: e.distance,
          pace: e.pace,
          hrZones: e.hrZones,
          source: e.source ?? 'watch',
        })));
      } else {
        const mockActivities = MOCK_DATA[selectedDevice].activities.map((a, i) => ({
          ...a,
          id: `${selectedDevice}_${i}`,
        }));
        setExercises(mockActivities);
      }
    } catch {
      const mockActivities = MOCK_DATA[selectedDevice].activities.map((a, i) => ({
        ...a,
        id: `${selectedDevice}_${i}`,
      }));
      setExercises(mockActivities);
    }
  }, [userId, selectedDevice]);

  useEffect(() => {
    fetchExercises();
    setMetrics(MOCK_DATA[selectedDevice].metrics);
  }, [fetchExercises, selectedDevice]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      if (userId !== 'demo') {
        await new Promise(r => setTimeout(r, 1800));
        const fresh = MOCK_DATA[selectedDevice];
        setMetrics(fresh.metrics);
        setExercises(fresh.activities.map((a, i) => ({ ...a, id: `${selectedDevice}_${i}` })));
      } else {
        await new Promise(r => setTimeout(r, 1800));
        const fresh = MOCK_DATA[selectedDevice];
        setMetrics(fresh.metrics);
        setExercises(fresh.activities.map((a, i) => ({ ...a, id: `${selectedDevice}_${i}` })));
      }
      setLastSync(new Date());
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (userId !== 'demo') {
      await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      await fetchExercises();
    } else {
      setExercises(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleHeartRateUpdate = (hr: number) => {
    setWatchHeartRate(hr);
    setMetrics(prev => ({
      ...prev,
      avgHeartRate: hr,
      peakHeartRate: Math.max(prev.peakHeartRate, hr),
    }));
  };

  const totalCalories = exercises.reduce((a, e) => a + e.calories, 0);
  const totalDuration = exercises.reduce((a, e) => a + e.duration, 0);


    return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* เพิ่ม Smartwatch Connection Component */}
      <SmartwatchConnection 
        userId={userId}
        onHeartRateUpdate={(hr) => {
          // อัปเดต heart rate แบบเรียลไทม์
          setMetrics(prev => ({
            ...prev,
            avgHeartRate: hr,
            peakHeartRate: Math.max(prev?.peakHeartRate || hr, hr),
          }));
          if (onHeartRateUpdate) onHeartRateUpdate(hr);
        }}
        onCaloriesUpdate={(deltaCal) => {
          setMetrics(prev => ({
            ...prev,
            caloriesBurned: prev.caloriesBurned + deltaCal
          }));
        }}
        onMetricsUpdate={(newMetrics) => {
          setMetrics(prev => {
            const updated = { ...prev };
            if (newMetrics.steps !== undefined) updated.steps = newMetrics.steps;
            if (newMetrics.sleepHours !== undefined) updated.sleepHours = newMetrics.sleepHours;
            return updated;
          });
        }}
      />



      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Calories burned', value: metrics.caloriesBurned, unit: 'kcal', goal: metrics.caloriesGoal, Icon: Flame, color: 'bg-red-500/10 text-red-500' },
          { label: 'Avg heart rate',  value: watchHeartRate || metrics.avgHeartRate, unit: 'bpm',  goal: null, Icon: Heart, color: 'bg-pink-500/10 text-pink-500', sub: `Peak: ${metrics.peakHeartRate} bpm` },
          { label: 'Steps',           value: metrics.steps.toLocaleString(), unit: '', goal: metrics.stepsGoal, Icon: Footprints, color: 'bg-blue-500/10 text-blue-500', isSteps: true },
          { label: 'Sleep',           value: metrics.sleepHours, unit: 'hr',   goal: null, Icon: Moon, color: 'bg-indigo-500/10 text-indigo-500', sub: `REM: ${metrics.sleepRem} hr` },
        ].map(({ label, value, unit, goal, Icon, color, sub, isSteps }) => (
          <div key={label} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
            <div className={`size-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="size-4" />
            </div>
            <p className="text-[11px] text-slate-400 mb-1">{label}</p>
            <p className="text-xl font-black">
              {isSteps ? value : typeof value === 'number' ? value < 10 ? value.toFixed(1) : value : value}
              <span className="text-xs font-normal text-slate-400 ml-1">{unit}</span>
            </p>
            {goal && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-700"
                    style={{ width: `${Math.min(isSteps ? (metrics.steps / goal) * 100 : (Number(value) / goal) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Goal: {isSteps ? goal.toLocaleString() : goal}{unit}</p>
              </div>
            )}
            {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Activity Rings + HR Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityRings metrics={metrics} />
        <HRZoneBar zones={metrics.hrZones} />
      </div>

      {/* Today's Workouts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" /> Today's Workouts
            <span className="text-xs font-normal text-slate-400">({exercises.length} activities)</span>
          </h3>
          {exercises.length > 0 && (
            <div className="flex gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Flame className="size-3 text-red-400" />{totalCalories} kcal</span>
              <span className="flex items-center gap-1"><Timer className="size-3 text-blue-400" />{totalDuration} min</span>
            </div>
          )}
        </div>

        {syncing ? (
          <div className="flex items-center justify-center gap-3 py-16 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="text-sm text-slate-400">กำลังซิงค์ข้อมูล...</span>
          </div>
        ) : exercises.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-16 text-center">
            <Watch className="size-12 mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-slate-400">ยังไม่มี workout วันนี้</p>
            <p className="text-xs text-slate-400 mt-1">เชื่อมต่อ Smartwatch หรือเพิ่ม workout ด้วยตัวเอง</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map(ex => (
              <WorkoutCard key={ex.id} ex={ex} onDelete={handleDelete} userId={userId} />
            ))}
          </div>
        )}
      </div>

      {/* Insight Banner */}
      {!syncing && exercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-primary">AI Insight</p>
            <p className="text-xs text-slate-500 mt-1">
              วันนี้คุณออกกำลังกายรวม <strong className="text-slate-700 dark:text-slate-300">{totalDuration} นาที</strong> เผาผลาญ <strong className="text-slate-700 dark:text-slate-300">{totalCalories} kcal</strong>
              {metrics.hrZones.zone3 + metrics.hrZones.zone4 > 40
                ? ' — ยอดเยี่ยม! ใช้เวลาใน Cardio/Peak zone มาก หัวใจแข็งแรงขึ้นแน่นอน 💪'
                : ' — ลองเพิ่ม intensity ขึ้นนิดนึงเพื่อเข้า Cardio zone นานขึ้น 🔥'}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary font-bold shrink-0">
            <Wind className="size-3" />
            <span>Smart</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}