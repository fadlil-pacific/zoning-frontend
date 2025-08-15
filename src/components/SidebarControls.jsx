import { Box, Paper, Stack, Typography, TextField, Select, MenuItem, Button, Divider } from '@mui/material';

export default function SidebarControls({ studyArea, setStudyArea, radius, setRadius, onRun, loading }) {
  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Select Study Area</Typography>
        <Stack direction="row" spacing={1} mt={1}>
          <Select
            size="small"
            value={studyArea.mode}
            onChange={(e) => setStudyArea({ ...studyArea, mode: e.target.value })}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="recommendation">Recommendation</MenuItem>
            <MenuItem value="drawn">Draw on Map</MenuItem>
            <MenuItem value="admin">Admin Area</MenuItem>
          </Select>
          <TextField
            size="small"
            label="Radius (m)"
            type="number"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            sx={{ width: 120 }}
          />
        </Stack>
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={onRun} disabled={loading}>
          {loading ? 'Running…' : 'Run Analysis'}
        </Button>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={1}>Recommended Facilities</Typography>
        <Box id="recommendations-slot" />
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Analysis results will appear here after running the analysis.
        </Typography>
      </Paper>
    </Stack>
  );
}
