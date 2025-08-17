import { Container, Grid, Box } from '@mui/material';
import Header from './layout/Header';
import SidebarControls from './components/SidebarControls';
// Hapus rekomendasi karena kita tidak pakai analisis terpisah lagi
// import Recommendations from './components/Recommendations';
import MapCanvas from './components/MapCanvas';
import ChatPanel from './components/ChatPanel';
import { useZoning } from './hooks/useZoning';
import React from 'react';
// pastikan askChat di services menerima objek: { message, term, bbox, contextId }
import { askChat } from './services/zoningApi';
import SearchResultsList from './components/SearchResultsList';

export default function App() {
  const { bbox, setBbox, term, setTerm, results, sendChat } = useZoning();
  const [messages, setMessages] = React.useState([]);
  const [isSending, setIsSending] = React.useState(false);
  const abortRef = React.useRef(null);

  const handleSend = async (text) => {
    setMessages((m) => [...m, { role: 'user', content: text }]);

    if (!bbox) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Please draw a rectangle on the map first.' }]);
      return;
    }

    // batalin request sebelumnya (kalau user spam)
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsSending(true);
      const { reply, raw } = await sendChat(text, controller.signal);
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: reply?.trim() ? reply : `No answer. Raw: ${JSON.stringify(raw)}` }
      ]);
    } catch (e) {
      const msg = e.name === 'CanceledError' || e.name === 'AbortError'
        ? 'Request canceled.'
        : `Chat API error. ${(e.response && e.response.status) ? `Status ${e.response.status}` : ''}`;
      setMessages((m) => [...m, { role: 'assistant', content: msg }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Grid container spacing={2} alignItems="flex-start">
          {/* Sidebar kiri */}
          <Grid size={{ xs: 12, md: 3, lg: 3 }}>
            <SidebarControls bbox={bbox} term={term} setTerm={setTerm} />
            <SearchResultsList items={results} /> {/* <-- tampilkan di bawah sidebar */}
          </Grid>

          {/* Map tengah */}
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <MapCanvas
              bbox={bbox}
              results={results}                // <-- kirim ke map untuk marker
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
          <Grid /* item */ /* xs={12} md={3} lg={3} */ size={{ xs: 12, md: 3, lg: 3 }}>
            <ChatPanel
              messages={messages}
              onSend={handleSend}
              disabled={!bbox || isSending}
              loading={isSending}
              hint="Please draw a rectangle on the map first."
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
