// src/components/SidebarControls.jsx
import { Paper, Stack, Typography, TextField, Grid } from '@mui/material';

export default function SidebarControls({ bbox, term, setTerm }) {
  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Search Term</Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="free text keyword"
          value={term}
          onChange={(e)=>setTerm(e.target.value)}
          sx={{ mt: 1 }}
        />

        <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>
          Bounding Box
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Draw rectangle on the map. These fields are read-only.
        </Typography>

        <Grid container spacing={1} mt={1}>
          <Grid item xs={6}>
            <TextField size="small" label="South (lat)" value={bbox?.south ?? ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6}>
            <TextField size="small" label="West (lng)"  value={bbox?.west  ?? ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6}>
            <TextField size="small" label="North (lat)" value={bbox?.north ?? ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
          <Grid item xs={6}>
            <TextField size="small" label="East (lng)"  value={bbox?.east  ?? ''} fullWidth InputProps={{ readOnly: true }} />
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}
