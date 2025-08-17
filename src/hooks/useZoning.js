// src/hooks/useZoning.js
import { useState, useCallback } from 'react';
import { askChat, searchByRectangle } from '../services/zoningApi';

export function useZoning() {
  const [bbox, setBbox] = useState(null); // {south,west,north,east}
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]); // <- points dari MCP

  const sendChat = useCallback(async (message, signal) => {
    // jalankan paralel: chat + search
    const [chat, mcp] = await Promise.all([
      askChat({ message, term, bbox, signal }),
      searchByRectangle({ term, bbox, signal })
    ]);
    setResults(mcp.items || []);
    return chat; // { reply, raw }
  }, [term, bbox]);

  return { bbox, setBbox, term, setTerm, results, sendChat };
}
