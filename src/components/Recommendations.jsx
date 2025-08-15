import { Stack, Paper, Typography, Box } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ParkIcon from '@mui/icons-material/Park';

const typeIcon = (t) => t === 'school' ? <SchoolIcon /> :
                      t === 'park' ? <ParkIcon /> : <Box sx={{ width: 24 }} />;

export default function Recommendations({ items = [] }) {
  if (!items.length) return null;
  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {items.map((rec) => (
        <Paper key={rec.id} sx={{ p: 1.5, display:'flex', gap:1.25, alignItems:'flex-start' }}>
          <Box mt="2px">{typeIcon(rec.type)}</Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {rec.type === 'school' ? 'New school needed' :
               rec.type === 'park' ? 'New park suggested' : rec.type}
            </Typography>
            <Typography variant="caption" color="text.secondary">{rec.reason}</Typography>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
