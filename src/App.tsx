import React, { useMemo, useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';

export const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('themeMode');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
        background: {
          default: mode === 'dark' ? '#181a1b' : '#f5f5f5',
          paper: mode === 'dark' ? '#23272b' : '#fff',
        },
      },
      typography: {
        h4: {
          fontWeight: 600,
        },
        h5: {
          fontWeight: 500,
        },
      },
    }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout />
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
