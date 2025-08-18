// src/services/zoningApi.js
import api from './apiClient';

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || '').toLowerCase() === 'true';

const f = (n) => (Number.isFinite(n) ? Number(n).toFixed(5) : '');

// === bilingual default prompt ===
function buildDefaultPrompt({ term, bbox, lang }) {
  const f = (n)=>Number.isFinite(n)?Number(n).toFixed(5):'';
  const north=f(bbox?.north), west=f(bbox?.west), south=f(bbox?.south), east=f(bbox?.east);
  return lang==='ja'
    ? `矩形ツールを使用してください: term="${term||''}", 左上=(${north},${west}), 右下=(${south},${east})。結果をすべて要約し、日本語で回答してください。`
    : `Use the rectangle tool: term="${term||''}", top-left=(${north},${west}), bottom-right=(${south},${east}). Then summarize all results and answer in English.`;
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

export async function askChat({ message, term, bbox, lang = 'en', signal }) {
  const preamble = buildDefaultPrompt({ term, bbox, lang });
  const query = `${preamble} ${message || ''}`.trim();

  if (USE_MOCK) return { reply: `[MOCK ${lang}] ${query}`, raw: { mock: true } };

  // gunakan proxy Vite: '/agent/ask' (atau ganti URL absolut kalau tidak pakai proxy)
  const { data } = await api.post('/agent/ask', { query }, { signal });
  return normalizeChatResponse(data);
}

export async function searchByRectangle({ term, bbox, signal }) {
  if (!bbox) return { items: [], raw: null };
  if (USE_MOCK) {
    return { items: [{ id:'1', title:'Mock point', lat:35.69, lon:139.69, year:'2021' }], raw:{ mock:true } };
  }
  const body = {
    tool: 'search_by_location_rectangle',
    args: {
      term: term || '',
      location_rectangle_top_left_lat:  bbox.north,
      location_rectangle_top_left_lon:  bbox.west,
      location_rectangle_bottom_right_lat: bbox.south,
      location_rectangle_bottom_right_lon: bbox.east
    }
  };
  const { data } = await api.post('/mcp/call', body, { signal });
  let parsed = {};
  try { parsed = JSON.parse(data?.output || '{}'); } catch {}
  const items = Array.isArray(parsed?.searchResults) ? parsed.searchResults : [];
  return { items, raw: data };
}
