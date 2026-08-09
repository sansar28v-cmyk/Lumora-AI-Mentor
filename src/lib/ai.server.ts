export async function callAIJson<T>(opts: {
  system: string;
  prompt: string;
  model?: string;
}): Promise<T> {
  const key = process.env["OPENROUTER_API_KEY"] || process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured");

  const GATEWAY_URL = process.env["OPENROUTER_API_KEY"] 
    ? "https://openrouter.ai/api/v1/chat/completions" 
    : "https://ai.gateway.lovable.dev/v1/chat/completions";

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173", // Optional, for OpenRouter rankings
      "X-Title": "Lumora", // Optional, for OpenRouter rankings
    },
    body: JSON.stringify({
      model: opts.model ?? (process.env["OPENROUTER_API_KEY"] ? "openai/gpt-4o-mini" : "google/gemini-3.5-flash"),
      max_tokens: 2500,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (res.status === 429) throw new Error("AI rate limit reached. Please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content ?? "";
  const cleaned = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    throw new Error("AI returned an unreadable response. Please retry.");
  }
}
