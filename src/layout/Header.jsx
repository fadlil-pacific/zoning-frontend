import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function Header() {
  return (
    <AppBar position="static" elevation={0} color="transparent" sx={{ borderBottom: '1px solid #e5e7eb' }}>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, textAlign: 'center' }}>
          ゾーニング分析
        </Typography>
        <IconButton size="large"><MenuIcon /></IconButton>
      </Toolbar>
    </AppBar>
  );
}
