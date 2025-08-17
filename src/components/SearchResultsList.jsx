// src/components/SearchResultsList.jsx
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';

export default function SearchResultsList({ items = [] }) {
  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Search Results ({items.length})
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No results yet.</Typography>
      ) : (
        <List dense disablePadding>
          {items.map((it, idx) => (
            <div key={it.id || idx}>
              <ListItem disableGutters>
                <ListItemText
                  primary={it.title || '(untitled)'}
                  secondary={`Year: ${it.year ?? '-'}  •  Lat:${it.lat?.toFixed?.(5)}  Lon:${it.lon?.toFixed?.(5)}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
              {idx < items.length - 1 && <Divider component="li" />}
            </div>
          ))}
        </List>
      )}
    </Paper>
  );
}
