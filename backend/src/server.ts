import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose, { Schema, Document } from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/nutriai_db';

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ═════════════════════════════════════════════════════════════════════════════
// MODELS
// ═════════════════════════════════════════════════════════════════════════════

// ── User ──────────────────────────────────────────────────────────────────────
interface IUser extends Document {
  name: string; email: string; calorieGoal: number; proteinGoal: number;
  carbsGoal: number; fatGoal: number; waterGoal: number; stepGoal: number;
}
const User = mongoose.model<IUser>('User', new Schema<IUser>({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  calorieGoal: { type: Number, default: 2200 },
  proteinGoal: { type: Number, default: 160 },
  carbsGoal:   { type: Number, default: 250 },
  fatGoal:     { type: Number, default: 70 },
  waterGoal:   { type: Number, default: 3.0 },
  stepGoal:    { type: Number, default: 10000 },
}, { timestamps: true }));

// ── Meal ──────────────────────────────────────────────────────────────────────
interface IMeal extends Document {
  userId: mongoose.Types.ObjectId; name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number; protein: number; carbs: number; fat: number;
  water: number; date: Date; time: string; imageUrl?: string;
}
const Meal = mongoose.model<IMeal>('Meal', new Schema<IMeal>({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  type:     { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
  calories: { type: Number, required: true, min: 0 },
  protein:  { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  water:    { type: Number, default: 0 },
  date:     { type: Date, default: Date.now },
  time:     { type: String, default: '' },
  imageUrl: { type: String },
}, { timestamps: true }));

// ── Recipe ────────────────────────────────────────────────────────────────────
interface IRecipe extends Document {
  name: string; tag: string; calories: number; protein: number; carbs: number;
  fat: number; prepTime: number; rating: number; ingredients: string[];
  steps: string[]; imageUrl?: string; savedBy: mongoose.Types.ObjectId[];
}
const Recipe = mongoose.model<IRecipe>('Recipe', new Schema<IRecipe>({
  name:        { type: String, required: true },
  tag:         { type: String, default: 'General' },
  calories:    { type: Number, required: true },
  protein:     { type: Number, default: 0 },
  carbs:       { type: Number, default: 0 },
  fat:         { type: Number, default: 0 },
  prepTime:    { type: Number, default: 15 },
  rating:      { type: Number, default: 4.5 },
  ingredients: [{ type: String }],
  steps:       [{ type: String }],
  imageUrl:    { type: String },
  savedBy:     [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }));

// ── ChatHistory ───────────────────────────────────────────────────────────────
interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[];
}
const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', new Schema<IChatHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role:      { type: String, enum: ['user', 'assistant'], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    _id: false,
  }],
}, { timestamps: true }));

// ── HealthProfile ─────────────────────────────────────────────────────────────
interface IHealthProfile extends Document {
  userId: mongoose.Types.ObjectId;
  weight: number; height: number; age: number;
  gender: string; activity: number;
  bmi: number; bmr: number; tdee: number;
  protein: number; carbs: number; fat: number; water: number;
}
const HealthProfile = mongoose.model<IHealthProfile>('HealthProfile', new Schema<IHealthProfile>({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  weight:   { type: Number, required: true },
  height:   { type: Number, required: true },
  age:      { type: Number, required: true },
  gender:   { type: String, default: 'male' },
  activity: { type: Number, default: 1.55 },
  bmi:      { type: Number, default: 0 },
  bmr:      { type: Number, default: 0 },
  tdee:     { type: Number, default: 0 },
  protein:  { type: Number, default: 0 },
  carbs:    { type: Number, default: 0 },
  fat:      { type: Number, default: 0 },
  water:    { type: Number, default: 0 },
}, { timestamps: true }));

// ── Exercise ──────────────────────────────────────────────────────────────────
interface IExercise extends Document {
  userId: mongoose.Types.ObjectId;
  name: string; type: string;
  duration: number; calories: number;
  sets?: number; reps?: number;
  date: Date; time: string;
}
const Exercise = mongoose.model<IExercise>('Exercise', new Schema<IExercise>({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  type:     { type: String, default: 'Cardio' },
  duration: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  sets:     { type: Number },
  reps:     { type: Number },
  date:     { type: Date, default: Date.now },
  time:     { type: String, default: '' },
}, { timestamps: true }));

// ═════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═════════════════════════════════════════════════════════════════════════════
app.get('/api/health-check', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ error: 'Name and email are required' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already exists' });
    const user = await User.create({ name, email });
    return res.status(201).json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) { console.error('Register error:', err); return res.status(500).json({ error: 'Failed to register' }); }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found. Please register first.' });
    return res.json({ _id: user._id, name: user.name, email: user.email });
  } catch (err) { console.error('Login error:', err); return res.status(500).json({ error: 'Failed to login' }); }
});

// ── Users ─────────────────────────────────────────────────────────────────────
app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch { return res.status(500).json({ error: 'Failed to fetch user' }); }
});
app.post('/api/users', async (req: Request, res: Response) => {
  try { return res.status(201).json(await User.create(req.body)); }
  catch { return res.status(400).json({ error: 'Failed to create user' }); }
});
app.patch('/api/users/:id', async (req: Request, res: Response) => {
  try { return res.json(await User.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch { return res.status(500).json({ error: 'Failed to update user' }); }
});

// ── Meals ─────────────────────────────────────────────────────────────────────
app.get('/api/meals', async (req: Request, res: Response) => {
  const { userId, date } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const start = date ? new Date(date as string) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setHours(23, 59, 59, 999);
  try {
    const meals = await Meal.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: 1 });
    const summary = meals.reduce(
      (acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat, water: acc.water + m.water }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 }
    );
    return res.json({ meals, summary });
  } catch { return res.status(500).json({ error: 'Failed to fetch meals' }); }
});
app.post('/api/meals', async (req: Request, res: Response) => {
  try { return res.status(201).json(await Meal.create(req.body)); }
  catch { return res.status(400).json({ error: 'Failed to create meal' }); }
});
app.delete('/api/meals/:id', async (req: Request, res: Response) => {
  try { await Meal.findByIdAndDelete(req.params.id); return res.json({ success: true }); }
  catch { return res.status(500).json({ error: 'Failed to delete meal' }); }
});

// ── Recipes ───────────────────────────────────────────────────────────────────
app.get('/api/recipes', async (req: Request, res: Response) => {
  const { tag } = req.query;
  try { return res.json(await Recipe.find(tag ? { tag } : {}).sort({ rating: -1 })); }
  catch { return res.status(500).json({ error: 'Failed to fetch recipes' }); }
});
app.post('/api/recipes', async (req: Request, res: Response) => {
  try { return res.status(201).json(await Recipe.create(req.body)); }
  catch { return res.status(400).json({ error: 'Failed to create recipe' }); }
});

// ── Chat History ──────────────────────────────────────────────────────────────
app.get('/api/chat/history/:userId', async (req: Request, res: Response) => {
  try { return res.json(await ChatHistory.findOne({ userId: req.params.userId }) ?? { messages: [] }); }
  catch { return res.status(500).json({ error: 'Failed to fetch chat history' }); }
});

// ── Chat (Groq AI) ────────────────────────────────────────────────────────────
app.post('/api/chat', async (req: Request, res: Response) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY is not set' });

  const { history = [], message, userId } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are NutriAI, a friendly personal AI nutritionist. Give concise practical advice about nutrition, meal planning, recipes, healthy eating, and exercise. Use emojis occasionally. Keep responses under 200 words unless a recipe is requested.' },
          ...history.map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : h.role,
            content: h.parts?.[0]?.text ?? h.content ?? '',
          })),
          { role: 'user', content: message },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    clearTimeout(timeout);
    const data = await groqRes.json();
    if (!groqRes.ok) return res.status(502).json({ error: data.error?.message ?? 'Groq API error' });

    const reply = data.choices?.[0]?.message?.content ?? 'Sorry, I could not respond right now.';

    if (userId && userId !== 'demo') {
      await ChatHistory.findOneAndUpdate(
        { userId },
        { $push: { messages: [
          { role: 'user',      content: message, timestamp: new Date() },
          { role: 'assistant', content: reply,   timestamp: new Date() },
        ]}},
        { upsert: true }
      );
    }
    return res.json({ reply });
  } catch (err: any) {
    if (err.name === 'AbortError') return res.status(504).json({ error: 'Request timed out' });
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Health Profile ────────────────────────────────────────────────────────────
app.get('/api/health/:userId', async (req: Request, res: Response) => {
  try {
    const profile = await HealthProfile.findOne({ userId: req.params.userId });
    return res.json(profile ?? null);
  } catch { return res.status(500).json({ error: 'Failed to fetch health profile' }); }
});

app.post('/api/health', async (req: Request, res: Response) => {
  const { userId, weight, height, age, gender, activity } = req.body;
  if (!userId || !weight || !height || !age) return res.status(400).json({ error: 'Missing required fields' });

  const bmi     = weight / ((height / 100) ** 2);
  const bmr     = gender === 'male'
    ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
  const tdee    = bmr * activity;
  const protein = weight * 2;
  const fat     = (tdee * 0.25) / 9;
  const carbs   = (tdee - protein * 4 - fat * 9) / 4;
  const water   = weight * 0.033;

  try {
    const profile = await HealthProfile.findOneAndUpdate(
      { userId },
      { userId, weight, height, age, gender, activity, bmi, bmr, tdee, protein, carbs, fat, water },
      { upsert: true, new: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error('Health profile error:', err);
    return res.status(500).json({ error: 'Failed to save health profile' });
  }
});

// ── Exercise Log ──────────────────────────────────────────────────────────────
app.get('/api/exercises', async (req: Request, res: Response) => {
  const { userId, date } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const start = date ? new Date(date as string) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setHours(23, 59, 59, 999);
  try {
    const exercises = await Exercise.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: 1 });
    const summary = exercises.reduce(
      (acc, e) => ({ calories: acc.calories + e.calories, duration: acc.duration + e.duration }),
      { calories: 0, duration: 0 }
    );
    return res.json({ exercises, summary });
  } catch { return res.status(500).json({ error: 'Failed to fetch exercises' }); }
});

app.post('/api/exercises', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const exercise = await Exercise.create({
      ...req.body,
      date: req.body.date ?? now.toISOString(),
      time: req.body.time ?? now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    });
    return res.status(201).json(exercise);
  } catch { return res.status(400).json({ error: 'Failed to create exercise' }); }
});

app.delete('/api/exercises/:id', async (req: Request, res: Response) => {
  try { await Exercise.findByIdAndDelete(req.params.id); return res.json({ success: true }); }
  catch { return res.status(500).json({ error: 'Failed to delete exercise' }); }
});

// ═════════════════════════════════════════════════════════════════════════════
// CONNECT DB → START SERVER
// ═════════════════════════════════════════════════════════════════════════════
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected → nutriai_db');
    app.listen(PORT, () => {
      console.log(`✅ Backend running  → http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });