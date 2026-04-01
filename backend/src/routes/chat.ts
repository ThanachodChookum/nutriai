import { Router, Request, Response } from 'express';

const router = Router();

const SYSTEM_PROMPT = `You are NutriAI, a friendly and knowledgeable personal AI nutritionist.
Give concise, practical advice about nutrition, meal planning, recipes, and healthy eating.
Use emojis occasionally to keep things friendly. Always be encouraging and positive.
Keep responses under 200 words unless a detailed recipe is requested.`;

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatBody {
  history: ChatMessage[];
  message: string;
}

// POST /api/chat
router.post('/', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in backend/.env.local' });
  }

  const { history = [], message }: ChatBody = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            ...history,
            { role: 'user', parts: [{ text: message }] },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: err.error?.message ?? 'Gemini API error' });
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      'Sorry, I could not respond right now.';

    return res.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;