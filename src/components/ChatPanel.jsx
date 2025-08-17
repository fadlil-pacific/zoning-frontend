// src/components/ChatPanel.jsx
import { Paper, Box, Stack, TextField, IconButton, Typography, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import React from 'react';

/**
 * Props:
 *  - messages: Array<{ role: 'user'|'assistant', content: string }>
 *  - onSend: (text: string) => void
 *  - disabled?: boolean          // kalau true, input & tombol nonaktif
 *  - hint?: string               // pesan info saat disabled, default: "Draw a rectangle on the map to enable chat."
 *  - placeholder?: string        // placeholder input
 *  - loading?: boolean           // opsional: tampilkan spinner kecil di header chat saat request berlangsung
 */
export default function ChatPanel({ messages = [], onSend, disabled = false, hint, placeholder, loading = false }) {
  const [text, setText] = React.useState('');
  const [isComposing, setIsComposing] = React.useState(false);
  const bottomRef = React.useRef(null);

  // auto scroll ke bawah setiap pesan berubah
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const doSend = React.useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }, [text, disabled, onSend]);

  const onKeyDown = (e) => {
    // Jangan kirim saat sedang IME composition (JP)
    if (isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  const effectiveHint = hint ?? 'Draw a rectangle on the map to enable chat.';

  return (
    <Paper sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header kecil */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ flex: 1, color: 'text.secondary' }}>
          Chat
        </Typography>
        {loading ? <CircularProgress size={16} /> : null}
      </Box>

      {/* Timeline */}
      <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
        {messages.length === 0 ? (
          <Typography color="text.secondary">
            Question example: “Why suggest new school here?”
          </Typography>
        ) : (
          messages.map((m, idx) => (
            <Box key={idx} sx={{ mb: 1.25, textAlign: m.role === 'user' ? 'right' : 'left' }}>
              <Paper
                sx={{
                  display: 'inline-block',
                  p: 1,
                  maxWidth: '90%',
                  bgcolor: m.role === 'user' ? 'primary.main' : 'background.paper',
                  color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Footer input */}
      <Stack direction="row" spacing={1} sx={{ p: 1, borderTop: '1px solid #eee', alignItems: 'flex-end' }}>
        <TextField
          size="small"
          fullWidth
          multiline
          maxRows={6}
          placeholder={placeholder ?? 'Type a question… (Shift+Enter for new line)'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          disabled={disabled}
        />
        <IconButton onClick={doSend} disabled={disabled || !text.trim()}>
          <SendIcon />
        </IconButton>
      </Stack>

      {/* Hint bar saat disabled */}
      {disabled && (
        <Box sx={{ px: 2, py: 1, borderTop: '1px dashed #eee', bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary">
            {effectiveHint}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
