export async function fetchTTS(text: string): Promise<ArrayBuffer> {
  const res = await fetch(`/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`TTS request failed (${res.status})`);
  return res.arrayBuffer();
}
