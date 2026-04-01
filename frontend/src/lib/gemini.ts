// frontend/src/lib/gemini.ts
// เรียก backend /api/chat แทนการเรียก Gemini โดยตรง
// → API key ปลอดภัย เก็บอยู่แค่ใน backend

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function sendMessage(
  history: ChatMessage[],
  message: string
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Server error');
  }

  const data = await res.json();
  return data.reply as string;
}