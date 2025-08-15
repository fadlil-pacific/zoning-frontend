import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f2a44' },   // tombol "Run Analysis"
    secondary: { main: '#f4b400' },
    background: { default: '#f5f6f8' }
  },
  shape: { borderRadius: 10 },
});
export default theme;
