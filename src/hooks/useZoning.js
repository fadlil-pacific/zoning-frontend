import { useState, useCallback } from 'react';
import { zoningApi } from '../services/zoningApi';

export function useZoning() {
  const [studyArea, setStudyArea] = useState({ mode: 'recommendation' });
  const [radius, setRadius] = useState(1000);
  const [overlays, setOverlays] = useState([]);          // Array<Overlay>
  const [recs, setRecs] = useState([]);                  // Array<Recommendation>
  const [loading, setLoading] = useState(false);
  const [contextId, setContextId] = useState(null);      // id analisis (kalau backend pakai)

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    try {
      const res = await zoningApi.runAnalysis(studyArea, radius);
      setOverlays(res.overlays || []);
      setRecs(res.recommendations || []);
      if (res.contextId) setContextId(res.contextId);
    } finally {
      setLoading(false);
    }
  }, [studyArea, radius]);

  return {
    studyArea, setStudyArea,
    radius, setRadius,
    overlays, recs, loading, runAnalysis,
    contextId
  };
}
