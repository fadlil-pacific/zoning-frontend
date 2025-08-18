// src/layout/Header.jsx (contoh cepat)
import { AppBar, Toolbar, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
export default function Header({ title='Zoning Planner', lang='en', setLang }) {
  return (
    <AppBar position="static" elevation={0} color="transparent">
      <Toolbar>
        <Typography variant="h6" sx={{ flex:1, textAlign: 'center' }}>{title}</Typography>
        <Box>
          <ToggleButtonGroup size="small" value={lang} exclusive onChange={(_,v)=>v&&setLang(v)}>
            <ToggleButton value="en">EN</ToggleButton>
            <ToggleButton value="ja">日本語</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
