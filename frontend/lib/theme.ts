import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0B5FFF',
    },
    secondary: {
      main: '#0F766E',
    },
    background: {
      default: '#F4F7FB',
      paper: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: -0.4,
    },
    h5: {
      fontWeight: 700,
    },
  },
});
