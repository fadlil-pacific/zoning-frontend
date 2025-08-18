// src/App.jsx
import React from 'react';
import { Container, Grid, Box } from '@mui/material';
import Header from './layout/Header';
import SidebarControls from './components/SidebarControls';
// import Recommendations from './components/Recommendations';
import MapCanvas from './components/MapCanvas';
import ChatPanel from './components/ChatPanel';
import SearchResultsList from './components/SearchResultsList';
import { useZoning } from './hooks/useZoning';

export default function App() {
  const { bbox, setBbox, term, setTerm, results, sendChat } = useZoning();

  const [messages, setMessages] = React.useState([]);
  const [isSending, setIsSending] = React.useState(false);
  const [lang, setLang] = React.useState('en'); // <-- language state: 'en' | 'ja'
  const abortRef = React.useRef(null);

  const t = React.useMemo(() => ({
    headerTitle: lang === 'ja' ? 'ゾーニング分析' : 'Zoning Planner',
    pleaseDraw:  lang === 'ja' ? 'まず地図上に矩形を描いてください。' : 'Please draw a rectangle on the map first.',
    apiError:    lang === 'ja' ? 'チャットAPIエラー。' : 'Chat API error.',
    placeholder: lang === 'ja' ? '質問を入力…（改行は Shift+Enter）' : 'Type a question… (Shift+Enter for new line)',
    hint:        lang === 'ja' ? 'まず地図上に矩形を描いてください。' : 'Please draw a rectangle on the map first.'
  }), [lang]);

  const handleSend = async (text) => {
    setMessages((m) => [...m, { role: 'user', content: text }]);

    if (!bbox) {
      setMessages((m) => [...m, { role: 'assistant', content: t.pleaseDraw }]);
      return;
    }

    // cancel request sebelumnya (kalau user spam kirim)
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsSending(true);
      // NOTE: kirimkan lang ke sendChat agar prompt/agent menyesuaikan bahasa
      const { reply, raw } = await sendChat(text, controller.signal, lang);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: reply?.trim() ? reply : `No answer. Raw: ${JSON.stringify(raw)}` }
      ]);
    } catch (e) {
      const msg = e.name === 'CanceledError' || e.name === 'AbortError'
        ? 'Request canceled.'
        : `${t.apiError}${e?.response?.status ? ` (Status ${e.response.status})` : ''}`;
      setMessages((m) => [...m, { role: 'assistant', content: msg }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box>
      {/* Pastikan Header menerima props lang & setLang */}
      <Header title={t.headerTitle} lang={lang} setLang={setLang} />

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Grid container spacing={2} alignItems="flex-start">
          {/* Sidebar kiri */}
          <Grid size={{ xs: 12, md: 3, lg: 3 }}>
            <SidebarControls bbox={bbox} term={term} setTerm={setTerm} />
            <SearchResultsList items={results} />
          </Grid>

          {/* Map tengah */}
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <MapCanvas
              bbox={bbox}
              results={results}
              onBBoxChange={(bounds) => {
                if (!bounds) { setBbox(null); return; }
                setBbox({
                  south: bounds.getSouth(),
                  west:  bounds.getWest(),
                  north: bounds.getNorth(),
                  east:  bounds.getEast()
                });
              }}
            />
          </Grid>

          {/* Chat kanan */}
          <Grid size={{ xs: 12, md: 3, lg: 3 }}>
            <ChatPanel
              messages={messages}
              onSend={handleSend}
              disabled={!bbox || isSending}
              loading={isSending}
              hint={t.hint}
              placeholder={t.placeholder}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
