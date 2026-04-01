import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Utensils, MessageSquare, Activity, Calendar,
  Plus, Bell, Share2, Flame, Droplets,
  ChevronRight, User, LogOut, Menu, X, Eye, EyeOff, ArrowRight,
  Leaf, Loader2, Trash2, Dumbbell, Scale, Timer, Check,
} from 'lucide-react';
import { Message } from './types';

interface DBMeal {
  _id: string;
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  time: string;
  date: string;
}

interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin }: { onLogin: (id: string, name: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email }),
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Register failed'); }
        const user = await res.json();
        localStorage.setItem('nutriai_userId', user._id);
        localStorage.setItem('nutriai_userName', user.name);
        onLogin(user._id, user.name);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email }),
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Login failed'); }
        const user = await res.json();
        localStorage.setItem('nutriai_userId', user._id);
        localStorage.setItem('nutriai_userName', user.name);
        onLogin(user._id, user.name);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    localStorage.setItem('nutriai_userId', 'demo');
    localStorage.setItem('nutriai_userName', 'Alex Rivera');
    onLogin('demo', 'Alex Rivera');
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background-dark">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(#59f20d 1px, transparent 1px), linear-gradient(90deg, #59f20d 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-md text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center mb-10">
              <div className="size-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Utensils className="size-7 text-background-dark" />
              </div>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight">Eat Smart.<br /><span className="text-primary">Live Better.</span></h1>
            <p className="text-slate-400 mt-6 text-lg leading-relaxed">Your personal AI nutritionist — tracking meals, planning diets, and guiding you toward your health goals every day.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-4">
            {[{ value: '10K+', label: 'Active Users' }, { value: '50K+', label: 'Meals Tracked' }, { value: '98%', label: 'Goal Success' }].map(({ value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-primary">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-3 text-left">
            {['AI-powered meal recommendations', 'Real-time calorie & macro tracking', 'Personalized weekly meal plans'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-400">
                <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Leaf className="size-3 text-primary" /></div>
                {f}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-[#0f1a0a]">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md space-y-8">
          <div className="flex lg:hidden items-center gap-3">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center"><Utensils className="size-5 text-background-dark" /></div>
            <h1 className="font-black text-2xl text-slate-900 dark:text-white">NutriAI</h1>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{mode === 'login' ? 'Welcome back 👋' : 'Create account 🌱'}</h2>
            <p className="text-slate-500 mt-2 text-sm">{mode === 'login' ? 'Sign in to continue your nutrition journey.' : 'Start your personalized nutrition plan today.'}</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === m ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Alex Rivera" required={mode === 'register'}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="alex@example.com" required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" required
                  className="w-full px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-red-500 text-xs font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  ❌ {error}
                </motion.p>
              )}
            </AnimatePresence>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary text-background-dark font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:scale-100">
              {loading ? <Loader2 className="size-5 animate-spin" /> : <>{mode === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight className="size-4" /></>}
            </button>
          </form>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <button onClick={handleDemo} className="w-full py-3.5 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm hover:border-primary/40 hover:text-primary transition-all">
            🚀 Try Demo Webpage (No account needed)
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ADD MEAL MODAL
// ═════════════════════════════════════════════════════════════════════════════
function AddMealModal({ userId, onClose, onAdded }: { userId: string; onClose: () => void; onAdded: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'Breakfast' as DBMeal['type'],
    calories: '', protein: '', carbs: '', fat: '', water: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const now = new Date();
      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, name: form.name, type: form.type,
          calories: Number(form.calories) || 0, protein: Number(form.protein) || 0,
          carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0, water: Number(form.water) || 0,
          date: now.toISOString(),
          time: now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        }),
      });
      onAdded();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black">Add Meal 🍽️</h3>
          <button onClick={onClose} className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Meal Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Grilled Salmon" required
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {[
              { name: 'calories', label: 'Calories (kcal)', placeholder: '450' },
              { name: 'protein',  label: 'Protein (g)',     placeholder: '42'  },
              { name: 'carbs',    label: 'Carbs (g)',       placeholder: '30'  },
              { name: 'fat',      label: 'Fat (g)',         placeholder: '18'  },
              { name: 'water',    label: 'Water (L)',       placeholder: '0.5' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
                <input name={name} type="number" min="0" step="0.1" value={(form as any)[name]} onChange={handleChange} placeholder={placeholder}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-background-dark font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:scale-100">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4" />Add Meal</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════════════
// HEALTH PROFILE TAB
// ═════════════════════════════════════════════════════════════════════════════
function HealthProfileTab({ userId }: { userId: string }) {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: 'male', activity: '1.55' });
  const [result, setResult] = useState<{ bmi: number; bmr: number; tdee: number; protein: number; carbs: number; fat: number; water: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // โหลดข้อมูลจาก DB เมื่อเปิดหน้า
  useEffect(() => {
    if (!userId || userId === 'demo') return;
    fetch(`/api/health/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.weight) {
          setForm({
            weight: String(data.weight), height: String(data.height),
            age: String(data.age), gender: data.gender, activity: String(data.activity),
          });
          setResult({ bmi: data.bmi, bmr: data.bmr, tdee: data.tdee, protein: data.protein, carbs: data.carbs, fat: data.fat, water: data.water });
          setSaved(true);
        }
      }).catch(() => {});
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const calculate = async () => {
    const w = Number(form.weight);
    const h = Number(form.height);
    const a = Number(form.age);
    const act = Number(form.activity);
    if (!w || !h || !a) return;
    setLoading(true);
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, weight: w, height: h, age: a, gender: form.gender, activity: act }),
      });
      const data = await res.json();
      setResult({ bmi: data.bmi, bmr: data.bmr, tdee: data.tdee, protein: data.protein, carbs: data.carbs, fat: data.fat, water: data.water });
      setSaved(true);
    } catch {
      // fallback คำนวณ local
      const bmi = w / ((h / 100) ** 2);
      const bmr = form.gender === 'male' ? 88.362 + 13.397*w + 4.799*h - 5.677*a : 447.593 + 9.247*w + 3.098*h - 4.330*a;
      const tdee = bmr * act;
      const protein = w * 2;
      const fat = (tdee * 0.25) / 9;
      const carbs = (tdee - protein*4 - fat*9) / 4;
      const water = w * 0.033;
      setResult({ bmi, bmr, tdee, protein, carbs, fat, water });
    } finally {
      setLoading(false);
    }
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (bmi < 25)   return { label: 'Normal', color: 'text-primary' };
    if (bmi < 30)   return { label: 'Overweight', color: 'text-yellow-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const activityLevels = [
    { value: '1.2',  label: 'Sedentary (no exercise)' },
    { value: '1.375', label: 'Light (1-3 days/week)' },
    { value: '1.55', label: 'Moderate (3-5 days/week)' },
    { value: '1.725', label: 'Active (6-7 days/week)' },
    { value: '1.9',  label: 'Very Active (2x/day)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-black">Health Profile 💪</h2>
        <p className="text-slate-500 text-sm mt-1">กรอกข้อมูลเพื่อคำนวณค่าสุขภาพของคุณ</p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Scale className="size-5 text-primary" />ข้อมูลส่วนตัว</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'weight', label: 'น้ำหนัก (kg)', placeholder: '65' },
            { name: 'height', label: 'ส่วนสูง (cm)', placeholder: '170' },
            { name: 'age',    label: 'อายุ (ปี)',     placeholder: '25' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
              <input name={name} type="number" min="0" value={(form as any)[name]} onChange={handleChange} placeholder={placeholder}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">เพศ</label>
            <select name="gender" value={form.gender} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
            </select>
          </div>

          <div className="col-span-2 lg:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">ระดับการออกกำลังกาย</label>
            <select name="activity" value={form.activity} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
              {activityLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <button onClick={calculate} disabled={loading}
          className="mt-6 w-full py-3.5 bg-primary text-background-dark font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 className="size-5 animate-spin" /> : <><Activity className="size-5" />{saved ? 'อัปเดต' : 'คำนวณและบันทึก'}</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h3 className="font-bold text-lg">ผลการคำนวณ</h3>

          {/* BMI Card */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold">BMI (ดัชนีมวลกาย)</h4>
              <span className={`text-sm font-black ${getBMIStatus(result.bmi).color}`}>{getBMIStatus(result.bmi).label}</span>
            </div>
            <p className="text-5xl font-black text-primary">{result.bmi.toFixed(1)}</p>
            <div className="mt-4 h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute h-full bg-gradient-to-r from-blue-400 via-primary to-red-400 w-full" />
              <div className="absolute h-full w-1 bg-white dark:bg-slate-900 rounded-full transition-all" style={{ left: `${Math.min(Math.max(((result.bmi - 15) / 25) * 100, 0), 100)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2">
              <span>15 Underweight</span><span>18.5 Normal</span><span>25 Overweight</span><span>30 Obese 40</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'BMR', value: Math.round(result.bmr), unit: 'kcal/day', desc: 'แคลอรี่พื้นฐาน', color: 'bg-blue-500/10 text-blue-500' },
              { label: 'TDEE', value: Math.round(result.tdee), unit: 'kcal/day', desc: 'แคลอรี่ที่ควรได้รับ', color: 'bg-primary/10 text-primary' },
              { label: 'น้ำ', value: result.water.toFixed(1), unit: 'L/day', desc: 'น้ำที่ควรดื่มต่อวัน', color: 'bg-cyan-500/10 text-cyan-500' },
              { label: 'Protein', value: Math.round(result.protein), unit: 'g/day', desc: 'โปรตีนที่ควรได้รับ', color: 'bg-orange-500/10 text-orange-500' },
            ].map(({ label, value, unit, desc, color }) => (
              <div key={label} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <div className={`size-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Activity className="size-5" />
                </div>
                <p className="text-2xl font-black">{value}<span className="text-xs font-normal text-slate-400 ml-1">{unit}</span></p>
                <p className="text-xs font-bold text-slate-400 mt-1">{label}</p>
                <p className="text-[10px] text-slate-400">{desc}</p>
              </div>
            ))}
          </div>

          {/* Macro breakdown */}
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h4 className="font-bold mb-4">สัดส่วนสารอาหารที่แนะนำต่อวัน</h4>
            <div className="space-y-4">
              {[
                { label: 'Protein', value: Math.round(result.protein), unit: 'g', color: 'bg-primary', pct: Math.round((result.protein * 4 / result.tdee) * 100) },
                { label: 'Carbs',   value: Math.round(result.carbs),   unit: 'g', color: 'bg-blue-500', pct: Math.round((result.carbs * 4 / result.tdee) * 100) },
                { label: 'Fat',     value: Math.round(result.fat),     unit: 'g', color: 'bg-orange-500', pct: Math.round((result.fat * 9 / result.tdee) * 100) },
              ].map(({ label, value, unit, color, pct }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{label}</span>
                    <span className="text-slate-500">{value}{unit} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EXERCISE LOG TAB
// ═════════════════════════════════════════════════════════════════════════════
interface ExerciseEntry {
  id: string;
  name: string;
  type: string;
  duration: number;
  calories: number;
  sets?: number;
  reps?: number;
  time: string;
}

function ExerciseLogTab({ userId }: { userId: string }) {
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loadingEx, setLoadingEx] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Cardio', duration: '', calories: '', sets: '', reps: '' });

  const exerciseTypes = ['Cardio', 'Strength', 'Yoga', 'HIIT', 'Swimming', 'Cycling', 'Running', 'Other'];

  const fetchExercises = useCallback(async () => {
    if (!userId || userId === 'demo') return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/exercises?userId=${userId}&date=${today}`);
      const data = await res.json();
      setExercises((data.exercises ?? []).map((e: any) => ({
        id: e._id, name: e.name, type: e.type,
        duration: e.duration, calories: e.calories,
        sets: e.sets, reps: e.reps, time: e.time,
      })));
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEx(true);
    try {
      if (userId !== 'demo') {
        await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId, name: form.name, type: form.type,
            duration: Number(form.duration) || 0,
            calories: Number(form.calories) || 0,
            sets: form.sets ? Number(form.sets) : undefined,
            reps: form.reps ? Number(form.reps) : undefined,
          }),
        });
        await fetchExercises();
      } else {
        const entry: ExerciseEntry = {
          id: Date.now().toString(), name: form.name, type: form.type,
          duration: Number(form.duration) || 0, calories: Number(form.calories) || 0,
          sets: form.sets ? Number(form.sets) : undefined,
          reps: form.reps ? Number(form.reps) : undefined,
          time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        };
        setExercises(prev => [...prev, entry]);
      }
    } finally {
      setForm({ name: '', type: 'Cardio', duration: '', calories: '', sets: '', reps: '' });
      setShowForm(false);
      setLoadingEx(false);
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

  const totalCalories = exercises.reduce((acc, e) => acc + e.calories, 0);
  const totalDuration = exercises.reduce((acc, e) => acc + e.duration, 0);

  const typeColor: Record<string, string> = {
    Cardio: 'bg-red-500', Strength: 'bg-blue-500', Yoga: 'bg-purple-500',
    HIIT: 'bg-orange-500', Swimming: 'bg-cyan-500', Cycling: 'bg-green-500',
    Running: 'bg-yellow-500', Other: 'bg-slate-500',
  };

  const typeEmoji: Record<string, string> = {
    Cardio: '🏃', Strength: '🏋️', Yoga: '🧘', HIIT: '⚡',
    Swimming: '🏊', Cycling: '🚴', Running: '🏃', Other: '💪',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Exercise Log 🏋️</h2>
          <p className="text-slate-500 text-sm mt-1">บันทึกการออกกำลังกายของวันนี้</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-background-dark rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
          <Plus className="size-4" />เพิ่มกิจกรรม
        </button>
      </div>

      {/* Summary */}
      {exercises.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"><Flame className="size-5" /></div>
              <span className="text-sm font-bold text-slate-400">แคลอรี่ที่เผาผลาญ</span>
            </div>
            <p className="text-3xl font-black text-red-500">{totalCalories}<span className="text-lg font-normal text-slate-400 ml-1">kcal</span></p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Timer className="size-5" /></div>
              <span className="text-sm font-bold text-slate-400">เวลารวม</span>
            </div>
            <p className="text-3xl font-black text-primary">{totalDuration}<span className="text-lg font-normal text-slate-400 ml-1">นาที</span></p>
          </div>
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-white dark:bg-slate-800/50 border border-primary/30 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Dumbbell className="size-4 text-primary" />เพิ่มกิจกรรม</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ชื่อกิจกรรม</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="วิ่ง, ยกน้ำหนัก..." required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ประเภท</label>
                    <select name="type" value={form.type} onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                      {exerciseTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">ระยะเวลา (นาที)</label>
                    <input name="duration" type="number" min="0" value={form.duration} onChange={handleChange} placeholder="30"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">แคลอรี่ที่เผาผลาญ</label>
                    <input name="calories" type="number" min="0" value={form.calories} onChange={handleChange} placeholder="200"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Sets (ถ้ามี)</label>
                    <input name="sets" type="number" min="0" value={form.sets} onChange={handleChange} placeholder="3"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Reps (ถ้ามี)</label>
                    <input name="reps" type="number" min="0" value={form.reps} onChange={handleChange} placeholder="12"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loadingEx}
                    className="flex-1 py-3 bg-primary text-background-dark font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-60">
                    {loadingEx ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4" />บันทึก</>}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:border-red-300 hover:text-red-500 transition-colors">
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise List */}
      {exercises.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-16 text-center">
          <Dumbbell className="size-12 mx-auto text-slate-300 mb-3" />
          <p className="font-bold text-slate-400">ยังไม่มีกิจกรรม</p>
          <p className="text-xs text-slate-400 mt-1">กด "เพิ่มกิจกรรม" เพื่อเริ่มบันทึก</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map(ex => (
            <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-center gap-4 group">
              <div className={`size-12 rounded-xl ${typeColor[ex.type] ?? 'bg-slate-400'} flex items-center justify-center text-xl shrink-0`}>
                {typeEmoji[ex.type] ?? '💪'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm truncate">{ex.name}</p>
                  <span className="text-xs text-slate-400 shrink-0 ml-2">{ex.time}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-slate-400 mt-1 flex-wrap">
                  {ex.duration > 0 && <span className="flex items-center gap-1"><Timer className="size-3" />{ex.duration} นาที</span>}
                  {ex.calories > 0 && <span className="flex items-center gap-1 text-red-400 font-bold"><Flame className="size-3" />{ex.calories} kcal</span>}
                  {ex.sets && <span>{ex.sets} sets</span>}
                  {ex.reps && <span>× {ex.reps} reps</span>}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white ${typeColor[ex.type] ?? 'bg-slate-400'} shrink-0`}>{ex.type}</span>
              <button onClick={() => handleDelete(ex.id)}
                className="size-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 shrink-0">
                <Trash2 className="size-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [userId, setUserId]               = useState<string | null>(null);
  const [userName, setUserName]           = useState('Alex Rivera');
  const [activeTab, setActiveTab]         = useState<'dashboard' | 'chat' | 'health' | 'exercise'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddMeal, setShowAddMeal]     = useState(false);
  const [meals, setMeals]                 = useState<DBMeal[]>([]);
  const [summary, setSummary]             = useState<DailySummary>({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  const [loadingMeals, setLoadingMeals]   = useState(false);
  const [messages, setMessages]           = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hello! I'm your personal AI nutritionist. Log your meals and I'll help you reach your nutrition goals! 🥗", timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');

  const goals = { calorie: 2200, protein: 160, carbs: 250, fat: 70, water: 3.0 };

  useEffect(() => {
    const id = localStorage.getItem('nutriai_userId');
    const name = localStorage.getItem('nutriai_userName');
    if (id) { setUserId(id); if (name) setUserName(name); }
  }, []);

  const fetchMeals = useCallback(async () => {
    if (!userId || userId === 'demo') return;
    setLoadingMeals(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/meals?userId=${userId}&date=${today}`);
      const data = await res.json();
      setMeals(data.meals ?? []);
      setSummary(data.summary ?? { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
    } catch (err) {
      console.error('Fetch meals error:', err);
    } finally {
      setLoadingMeals(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMeals();
    const interval = setInterval(fetchMeals, 30000);
    return () => clearInterval(interval);
  }, [fetchMeals]);

  const handleLogin  = (id: string, name: string) => { setUserId(id); setUserName(name); };
  const handleLogout = () => {
    localStorage.removeItem('nutriai_userId');
    localStorage.removeItem('nutriai_userName');
    setUserId(null);
  };
  const handleDeleteMeal = async (id: string) => {
    await fetch(`/api/meals/${id}`, { method: 'DELETE' });
    fetchMeals();
  };
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || chatLoading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, message: content, userId }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply ?? 'Sorry, I could not respond right now.',
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again. 🙏',
        timestamp: new Date(),
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!userId) return <LoginPage onLogin={handleLogin} />;

  const displaySummary = userId === 'demo'
    ? { calories: 1450, protein: 112, carbs: 145, fat: 42, water: 2.4 }
    : summary;

  const displayMeals = userId === 'demo'
    ? [
        { _id: 'd1', name: 'Quinoa Buddha Bowl', type: 'Lunch'  as const, calories: 380, protein: 15, carbs: 45, fat: 12, water: 0, time: '12:30 PM', date: '' },
        { _id: 'd2', name: 'Lemon Herb Salmon',  type: 'Dinner' as const, calories: 450, protein: 42, carbs: 8,  fat: 22, water: 0, time: '7:00 PM',  date: '' },
      ]
    : meals;

  const mealTypeColor: Record<string, string> = {
    Breakfast: 'bg-yellow-500', Lunch: 'bg-blue-500', Dinner: 'bg-purple-500', Snack: 'bg-emerald-500',
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <AnimatePresence>
        {showAddMeal && userId !== 'demo' && (
          <AddMealModal userId={userId} onClose={() => setShowAddMeal(false)} onAdded={fetchMeals} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-background-dark/50 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-background-dark"><Utensils className="size-6" /></div>
            <div><h1 className="font-bold text-xl tracking-tight">NutriAI</h1><p className="text-xs text-slate-500">Intelligent Dining</p></div>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100" onClick={() => setIsSidebarOpen(false)}><X className="size-4" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-3 mb-2">Main Menu</div>
          {([
            { id: 'dashboard', label: 'Dashboard',         Icon: Menu          },
            { id: 'chat',      label: 'AI Chat Assistant', Icon: MessageSquare },
            { id: 'health',    label: 'Health Profile',    Icon: Activity      },
            { id: 'exercise',  label: 'Exercise Log',      Icon: Dumbbell      },
          ] as const).map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === id ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <Icon className="size-5" /><span className="text-sm font-medium">{label}</span>
            </button>
          ))}

        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="bg-primary/5 rounded-xl p-4">
            <p className="text-xs font-medium text-primary mb-2">Daily Calories</p>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min((displaySummary.calories / goals.calorie) * 100, 100)}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">{displaySummary.calories} / {goals.calorie} kcal</p>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden ring-2 ring-primary/20">
              <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{userName}</p>
              <p className="text-xs text-slate-500">Pro Member</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-red-500 transition-colors"><LogOut className="size-5" /></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"><Menu className="size-5" /></button>
            <h2 className="font-semibold text-lg capitalize">{activeTab}</h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">Online</span>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'dashboard' && userId !== 'demo' && (
              <button onClick={() => setShowAddMeal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                <Plus className="size-4" />Add Meal
              </button>
            )}
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><Bell className="size-5" /></button>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><Share2 className="size-5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">

            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 lg:p-8 space-y-8">

                {/* ── Stats: Calories + Hydration only ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Calories',  value: displaySummary.calories, unit: 'kcal', goal: goals.calorie, color: 'bg-primary',  iconBg: 'bg-primary/10 text-primary',   Icon: Flame    },
                    { label: 'Hydration', value: displaySummary.water,    unit: 'L',    goal: goals.water,   color: 'bg-blue-500', iconBg: 'bg-blue-500/10 text-blue-500', Icon: Droplets },
                  ].map(({ label, value, unit, goal, color, iconBg, Icon }) => (
                    <div key={label} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`size-10 rounded-xl ${iconBg} flex items-center justify-center`}><Icon className="size-5" /></div>
                        <span className="text-sm font-bold text-slate-400">{label}</span>
                      </div>
                      <p className="text-3xl font-black">
                        {value < 10 ? Number(value).toFixed(1) : Math.round(value).toLocaleString()}
                        <span className="text-lg font-normal text-slate-500 ml-1">{unit}</span>
                      </p>
                      <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${Math.min((value / goal) * 100, 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">Goal: {goal}{unit}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Meals list */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">Today's Meals</h3>
                      <div className="flex items-center gap-2">
                        {loadingMeals && <Loader2 className="size-4 animate-spin text-primary" />}
                        <span className="text-xs text-slate-400">{displayMeals.length} meals logged</span>
                      </div>
                    </div>
                    {displayMeals.length === 0 ? (
                      <div className="bg-white dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
                        <Utensils className="size-10 mx-auto text-slate-300 mb-3" />
                        <p className="font-bold text-slate-400">No meals logged yet</p>
                        <p className="text-xs text-slate-400 mt-1">Click "Add Meal" to start tracking</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {displayMeals.map(meal => (
                          <motion.div key={meal._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-center gap-4 group">
                            <div className={`size-12 rounded-xl ${mealTypeColor[meal.type] ?? 'bg-slate-400'} flex items-center justify-center text-lg shrink-0`}>
                              {meal.type === 'Breakfast' ? '🌅' : meal.type === 'Lunch' ? '☀️' : meal.type === 'Dinner' ? '🌙' : '🍎'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-sm truncate">{meal.name}</p>
                                <span className="text-xs text-slate-400 shrink-0 ml-2">{meal.time}</span>
                              </div>
                              <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                                <span className="text-primary font-bold">{meal.calories} kcal</span>
                                <span>P: {meal.protein}g</span>
                                <span>C: {meal.carbs}g</span>
                                <span>F: {meal.fat}g</span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white ${mealTypeColor[meal.type] ?? 'bg-slate-400'} shrink-0`}>{meal.type}</span>
                            {userId !== 'demo' && (
                              <button onClick={() => handleDeleteMeal(meal._id)}
                                className="size-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 shrink-0">
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nutrient breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Nutrient Breakdown</h3>
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl space-y-5">
                      {[
                        { label: 'Protein', consumed: displaySummary.protein, goal: goals.protein, color: 'bg-primary'    },
                        { label: 'Carbs',   consumed: displaySummary.carbs,   goal: goals.carbs,   color: 'bg-blue-500'  },
                        { label: 'Fat',     consumed: displaySummary.fat,     goal: goals.fat,     color: 'bg-orange-500' },
                      ].map(({ label, consumed, goal, color }) => (
                        <div key={label} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{label}</span>
                            <span className="text-slate-500">{Math.round(consumed)}g / {goal}g</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${Math.min((consumed / goal) * 100, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span>Calories</span>
                          <span className="text-primary font-bold">{Math.round(displaySummary.calories)} / {goals.calorie} kcal</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-700" style={{ width: `${Math.min((displaySummary.calories / goals.calorie) * 100, 100)}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">{Math.max(0, goals.calorie - Math.round(displaySummary.calories))} kcal remaining</p>
                      </div>
                      {userId !== 'demo' && (
                        <button onClick={() => setShowAddMeal(true)}
                          className="w-full py-3 bg-primary text-background-dark rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                          <Plus className="size-4" />Add Meal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 custom-scrollbar">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-primary text-background-dark' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {msg.role === 'assistant' ? <Utensils className="size-5" /> : <User className="size-5" />}
                      </div>
                      <div className={`p-4 rounded-2xl shadow-sm max-w-xl ${msg.role === 'assistant' ? 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-tl-none' : 'bg-primary text-background-dark rounded-tr-none font-medium'}`}>
                        <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-start gap-4 max-w-3xl">
                      <div className="size-10 rounded-xl bg-primary text-background-dark flex items-center justify-center shrink-0">
                        <Utensils className="size-5" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-tl-none">
                        <Loader2 className="size-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 lg:p-6 bg-white/50 dark:bg-background-dark/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shrink-0">
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-end gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-2xl shadow-xl">
                      <textarea value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-slate-100 resize-none py-2 px-2 max-h-32 text-sm outline-none"
                        placeholder="Ask about ingredients, recipes, or nutrition..." rows={1} disabled={chatLoading} />
                      <button onClick={() => handleSendMessage()} disabled={chatLoading || !input.trim()}
                        className="size-10 bg-primary text-background-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform shrink-0 disabled:opacity-50 disabled:scale-100">
                        {chatLoading ? <Loader2 className="size-4 animate-spin" /> : <ChevronRight className="size-5" />}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-3 justify-center flex-wrap">
                      {['Low Carb Meals', 'High Protein Ideas', 'Vegan Options', 'Exercise Ideas', 'Exercise Planning'].map(tag => (
                        <button key={tag} onClick={() => handleSendMessage(tag)} disabled={chatLoading}
                          className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50">{tag}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}


            {/* ── HEALTH PROFILE ── */}
            {activeTab === 'health' && (
              <motion.div key="health" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 lg:p-8 space-y-8">
                <HealthProfileTab userId={userId} />
              </motion.div>
            )}

            {/* ── EXERCISE LOG ── */}
            {activeTab === 'exercise' && (
              <motion.div key="exercise" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 lg:p-8 space-y-8">
                <ExerciseLogTab userId={userId} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}