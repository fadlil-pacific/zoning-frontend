// src/hooks/useZoning.js
import { useState, useCallback } from 'react';
import { askChat } from '../services/zoningApi';

export function useZoning() {
  const [bbox, setBbox] = useState(null);
  const [term, setTerm] = useState('');
  const sendChat = useCallback((message, signal) => askChat({ message, term, bbox, signal }), [term, bbox]);
  return { bbox, setBbox, term, setTerm, sendChat };
}