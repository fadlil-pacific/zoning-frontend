import api from './apiClient';

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || '').toLowerCase() === 'true';

function buildDefaultPrompt(term, bbox) {
  const f = (n) => (Number.isFinite(n) ? Number(n).toFixed(5) : '');
  const north = f(bbox?.north), west = f(bbox?.west);
  const south = f(bbox?.south), east = f(bbox?.east);
  return `Use the rectangle tool: term="${term || ''}", top-left=(${north},${west}), bottom-right=(${south},${east}). Then summarize the all result.`;
}

function normalizeChatResponse(data) {
  let reply =
    data?.answer ??
    data?.reply ??
    data?.message ??
    data?.content ??
    data?.result ??
    data?.text ??
    (Array.isArray(data?.choices) ? data.choices[0]?.message?.content : undefined);
  if (reply && typeof reply === 'object') reply = JSON.stringify(reply);
  return { reply: reply ?? '', raw: data };
}

export async function askChat({ message, term, bbox, signal }) {
  const preamble = buildDefaultPrompt(term, bbox);
  const query = `${preamble} ${message || ''}`.trim();

  if (USE_MOCK) return { reply: `[MOCK] ${query}`, raw: { mock: true } };

  // Lewat proxy Vite → bebas CORS saat dev
  const url = '/agent/ask';
  const { data } = await api.post(url, { query }, { signal });
  return normalizeChatResponse(data);
}
