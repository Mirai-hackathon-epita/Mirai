import "server-only";

// ─── Cloud Temple LLMaaS client ─────────────────────────────────────
// Thin wrapper over the OpenAI-compatible /chat/completions endpoint served
// by Cloud Temple (sovereign AI, Mistral Small). No SDK lock-in: a single
// fetch keeps deps minimal and the demo robust. Every caller is expected to
// provide a deterministic fallback so the product never crashes offline.

const BASE_URL = (
  process.env.CLOUD_TEMPLE_BASE_URL || "https://api.ai.cloud-temple.com/v1"
).replace(/\/$/, "");
const API_KEY = process.env.CLOUD_TEMPLE_API_KEY || "";
const MODEL = process.env.CLOUD_TEMPLE_MODEL || "mistral-small";
const VISION_MODEL = process.env.CLOUD_TEMPLE_VISION_MODEL || MODEL;
const OFFLINE = process.env.MIRA_OFFLINE === "1";

export const LLM_ENABLED = Boolean(API_KEY) && !OFFLINE;

export class LLMUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LLMUnavailableError";
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  model?: string;
  signal?: AbortSignal;
}

async function call(messages: ChatMessage[], opts: ChatOptions): Promise<string> {
  if (!LLM_ENABLED) {
    throw new LLMUnavailableError("CLOUD_TEMPLE_API_KEY not set (or offline)");
  }
  const body: Record<string, unknown> = {
    model: opts.model || MODEL,
    messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 800,
  };
  if (opts.json) body.response_format = { type: "json_object" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: opts.signal ?? controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new LLMUnavailableError(`LLMaaS ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new LLMUnavailableError("LLMaaS returned no content");
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

/** Plain text completion. Throws LLMUnavailableError when offline/failing. */
export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string> {
  return call(messages, opts);
}

/** Strict JSON completion. Parses defensively (handles code-fenced output). */
export async function chatJSON<T>(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<T> {
  const raw = await call(messages, { ...opts, json: true });
  return parseJSON<T>(raw);
}

/** OCR / vision: read handwritten math from an image data URL. */
export async function vision(
  imageUrl: string,
  prompt: string,
  opts: ChatOptions = {},
): Promise<string> {
  return call(
    [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    { ...opts, model: opts.model || VISION_MODEL, temperature: opts.temperature ?? 0 },
  );
}

export function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Best-effort: grab the first {...} or [...] block.
    const match = cleaned.match(/[{[][\s\S]*[}\]]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new LLMUnavailableError("Failed to parse LLM JSON output");
  }
}

/** Small unique id helper (not crypto-grade; fine for demo records). */
export function genId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
