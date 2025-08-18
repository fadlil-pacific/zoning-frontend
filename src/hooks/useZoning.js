// src/hooks/useZoning.js
import { useState, useCallback } from 'react';
import { askChat, searchByRectangle } from '../services/zoningApi';

export function useZoning() {
  const [bbox, setBbox] = useState(null);   // {south,west,north,east}
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]); // points dari MCP
  const [lang, setLang] = useState('en');     // 'en' | 'ja'

  const sendChat = useCallback((message, signal, lang) => {
    return Promise.all([
      askChat({ message, term, bbox, lang, signal }),
      searchByRectangle({ term, bbox, signal })
    ]).then(([chat, mcp]) => {
      setResults(mcp.items || []);
      return chat;
    });
  }, [term, bbox]);

  return { bbox, setBbox, term, setTerm, lang, setLang, results, sendChat };
}
