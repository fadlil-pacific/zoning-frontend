import api from './apiClient';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK || 'false') === 'true';

const mockOverlays = [
  { kind: 'residential', geojson: { /* … */ } },
  { kind: 'commercial',  geojson: { /* … */ } },
  { kind: 'residential', geojson: { /* … */ } },
  { kind: 'industrial',  geojson: { /* … */ } },
];

const mockRecs = [
  {
    id: 'r1',
    type: 'school',
    reason: 'Population density tinggi, tidak ada sekolah dalam 1km',
    location: { /* point/area */ }
  },
  {
    id: 'r2',
    type: 'park',
    reason: 'Kekurangan ruang hijau pada blok padat penduduk',
  }
];

async function safePost(url, payload, fallback) {
  if (USE_MOCK) return fallback;
  try {
    const { data } = await api.post(url, payload);
    return data;
  } catch (e) {
    console.warn('API error, fallback to mock:', e?.message || e);
    return fallback;
  }
}

export const zoningApi = {
  getOverlays: async (studyArea, radius) =>
    safePost('/zoning/overlays', { studyArea, radius }, { overlays: mockOverlays }),

  runAnalysis: async (studyArea, extra = {}) => {
    // extra dapat berisi { term }
    const { data } = await api.post('/zoning/analysis', { studyArea, ...extra });
    return data;
  },

  askChat: async (message, contextId) =>
    safePost('/zoning/chat', { message, contextId }, {
      reply: 'Rekomendasi sekolah karena kepadatan penduduk tinggi dan tidak ada sekolah dalam radius 1km.'
    })
};
