import { Paper, Box, Stack, TextField, IconButton, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import React from 'react';

export default function ChatPanel({ messages, onSend, disabled }) {
  const [text, setText] = React.useState('');

  return (
    <Paper sx={{ height: 'calc(100vh - 140px)', display:'flex', flexDirection:'column' }}>
      <Box sx={{ flex:1, p:2, overflow:'auto' }}>
        {messages.length === 0 ? (
          <Typography color="text.secondary">Question: “Why suggest new school here?”</Typography>
        ) : messages.map((m, idx) => (
          <Box key={idx} sx={{ mb:1.25, textAlign: m.role==='user' ? 'right' : 'left' }}>
            <Paper sx={{ display:'inline-block', p:1, maxWidth:'90%' }}>
              <Typography variant="body2">{m.content}</Typography>
            </Paper>
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={1} sx={{ p:1, borderTop:'1px solid #eee' }}>
        <TextField
          size="small" fullWidth placeholder="Type a question…"
          value={text} onChange={(e)=>setText(e.target.value)}
          onKeyDown={(e)=>{ if (e.key==='Enter' && text) { onSend(text); setText(''); } }}
        />
        <IconButton onClick={()=>{ if(text){ onSend(text); setText(''); }}} disabled={disabled || !text}>
          <SendIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}
