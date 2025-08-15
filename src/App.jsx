import { Container, Grid, Box } from '@mui/material';
import Header from './layout/Header';
import SidebarControls from './components/SidebarControls';
import Recommendations from './components/Recommendations';
import MapCanvas from './components/MapCanvas';
import ChatPanel from './components/ChatPanel';
import { useZoning } from './hooks/useZoning';
import { zoningApi } from './services/zoningApi';
import React from 'react';

export default function App() {
  const {
    studyArea, setStudyArea,
    radius, setRadius,
    overlays, recs, loading, runAnalysis,
    contextId
  } = useZoning();

  const [messages, setMessages] = React.useState([]);

  const handleSend = async (text) => {
    setMessages((m)=>[...m, { role:'user', content:text }]);
    try {
      // coba backend (atau mock bila VITE_USE_MOCK=true)
      const { reply } = await zoningApi.askChat(text, contextId);
      setMessages((m)=>[...m, { role:'assistant', content: reply }]);
    } catch {
      // fallback ekstra
      const first = recs[0];
      const fallback = first
        ? `Suggested ${first.type} karena: ${first.reason}`
        : 'Belum ada hasil analisis.';
      setMessages((m)=>[...m, { role:'assistant', content: fallback }]);
    }
  };


  return (
    <Box>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Grid container spacing={2} alignItems="flex-start">
          {/* Sidebar kiri */}
          <Grid /* item */ /* xs={12} md={3} lg={3} */ size={{ xs: 12, md: 3, lg: 3 }}>
            <SidebarControls
              studyArea={studyArea}
              setStudyArea={setStudyArea}
              radius={radius}
              setRadius={setRadius}
              onRun={runAnalysis}
              loading={loading}
            />
            <Recommendations items={recs} />
          </Grid>

          {/* Map tengah */}
          <Grid /* item */ /* xs={12} md={6} lg={6} */ size={{ xs: 12, md: 6, lg: 6 }}>
            <MapCanvas geojsonOverlays={overlays} 
            // recommendations={recs} 
            />
          </Grid>

          {/* Chat kanan */}
          <Grid /* item */ /* xs={12} md={3} lg={3} */ size={{ xs: 12, md: 3, lg: 3 }}>
            <ChatPanel messages={messages} onSend={handleSend} disabled={loading} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
