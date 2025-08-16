// src/components/SidebarControls.jsx
import { Paper, Stack, Typography, TextField, Button, Grid } from '@mui/material';
import * as React from 'react';

export default function SidebarControls({ bbox, setBbox, term, setTerm, onRun, loading }) {
  const [local, setLocal] = React.useState(bbox || { south: -6.3, west: 106.7, north: -6.1, east: 106.95 });
  React.useEffect(() => { if (bbox) setLocal(bbox); }, [bbox]);

  const onChange = (k) => (e) => setLocal((s)=>({ ...s, [k]: e.target.value }));

  const parsed = {
    south: Number(local.south), west: Number(local.west),
    north: Number(local.north), east: Number(local.east)
  };
  const ok = Object.values(parsed).every(Number.isFinite) && parsed.south < parsed.north && parsed.west < parsed.east;

  const applyAndRun = () => {
    if (!ok) return;
    setBbox(parsed);
    onRun({ bboxArray: [parsed.west, parsed.south, parsed.east, parsed.north], term });
  };

  return (
    <Stack spacing={2}>
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Bounding Box</Typography>

        <Grid container spacing={1} mt={1}>
          <Grid item xs={6}><TextField size="small" label="South (lat)" value={local.south} onChange={onChange('south')} fullWidth /></Grid>
          <Grid item xs={6}><TextField size="small" label="West (lng)"  value={local.west}  onChange={onChange('west')}  fullWidth /></Grid>
          <Grid item xs={6}><TextField size="small" label="North (lat)" value={local.north} onChange={onChange('north')} fullWidth /></Grid>
          <Grid item xs={6}><TextField size="small" label="East (lng)"  value={local.east}  onChange={onChange('east')}  fullWidth /></Grid>
        </Grid>

        <Stack direction="row" spacing={1} mt={1}>
          <Button variant="outlined" fullWidth onClick={()=> setBbox(parsed) } disabled={!ok}>
            Use map
          </Button>
          <Button variant="contained" fullWidth onClick={applyAndRun} disabled={!ok || loading}>
            {loading ? 'Running…' : 'Bunseki'}
          </Button>
        </Stack>

        {!ok && <Typography variant="caption" color="error" display="block" mt={1}>Invalid bbox.</Typography>}

        <TextField
          size="small" label="Term (optional)" value={term}
          onChange={(e)=>setTerm(e.target.value)} fullWidth sx={{ mt: 1.5 }}
          placeholder="free text keyword"
        />
      </Paper>
    </Stack>
  );
}
