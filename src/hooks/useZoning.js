// src/hooks/useZoning.js
import { useState, useCallback } from 'react';
import { zoningApi } from '../services/zoningApi';

export function useZoning() {
  const [bbox, setBbox] = useState({ south: -6.3, west: 106.7, north: -6.1, east: 106.95 });
  const [term, setTerm] = useState('');
  const [overlays, setOverlays] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contextId, setContextId] = useState(null);

  const runAnalysis = useCallback(async (opts) => {
    setLoading(true);
    try {
      const bboxArray = opts?.bboxArray ?? [bbox.west, bbox.south, bbox.east, bbox.north]; // [minLng,minLat,maxLng,maxLat]
      const res = await zoningApi.runAnalysis(
        { mode: 'drawn', bbox: bboxArray }, // studyArea
        { term }                             // extra params
      );
      setOverlays(res.overlays || []);
      setRecs(res.recommendations || []);
      if (res.contextId) setContextId(res.contextId);
    } finally {
      setLoading(false);
    }
  }, [bbox, term]);

  return {
    bbox, setBbox,
    term, setTerm,
    overlays, recs, loading, runAnalysis,
    contextId
  };
}
