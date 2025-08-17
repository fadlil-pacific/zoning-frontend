// src/services/zoningApi.js
import api from './apiClient';

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || '').toLowerCase() === 'true';

function f(n){ return Number.isFinite(n) ? Number(n).toFixed(5) : ''; }
function buildDefaultPrompt(term, bbox){
  const north=f(bbox?.north), west=f(bbox?.west), south=f(bbox?.south), east=f(bbox?.east);
  return `Use the rectangle tool: term="${term||''}", top-left=(${north},${west}), bottom-right=(${south},${east}). Then summarize the all result.`;
}

function normalizeChatResponse(data){
  let reply = data?.answer ?? data?.reply ?? data?.message ?? data?.content ?? data?.result ?? data?.text ??
              (Array.isArray(data?.choices) ? data.choices[0]?.message?.content : undefined);
  if (reply && typeof reply === 'object') reply = JSON.stringify(reply);
  return { reply: reply ?? '', raw: data };
}

// === existing chat ===
export async function askChat({ message, term, bbox, signal }) {
  const preamble = buildDefaultPrompt(term, bbox);
  const query = `${preamble} ${message || ''}`.trim();

  if (USE_MOCK) return { reply: `[MOCK] ${query}`, raw: { mock: true } };

  // pakai proxy Vite / URL absolut sesuai setup kamu
  const { data } = await api.post('/agent/ask', { query }, { signal });
  return normalizeChatResponse(data);
}

// === NEW: search_by_location_rectangle ===
export async function searchByRectangle({ term, bbox, signal }) {
  if (!bbox) return { items: [], raw: null };

  if (USE_MOCK) {
    return {
      items: [
        { id: '1', title: 'Mock point A', lat: 35.69, lon: 139.69, year: '2021', dataset_id: 'mock', catalog_id: 'mock' },
        { id: '2', title: 'Mock point B', lat: 35.70, lon: 139.70, year: '2021', dataset_id: 'mock', catalog_id: 'mock' },
      ],
      raw: { mock: true }
    };
  }

  const body = {
    tool: 'search_by_location_rectangle',
    args: {
      term: term || '',
      location_rectangle_top_left_lat:  bbox.north,
      location_rectangle_top_left_lon:  bbox.west,
      location_rectangle_bottom_right_lat: bbox.south,
      location_rectangle_bottom_right_lon: bbox.east,
    }
  };

  const { data } = await api.post('/mcp/call', body, { signal });

  // backend mengembalikan data.output berupa JSON string → parse aman
  let parsed = {};
  try { parsed = JSON.parse(data?.output || '{}'); } catch { parsed = {}; }
  const items = Array.isArray(parsed?.searchResults) ? parsed.searchResults : [];

  return { items, raw: data };
}
