import React, { useMemo, useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';

export const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

// Use basename for GitHub Pages in production, empty for local development
const basename = import.meta.env.MODE === 'production' ? '/qa-commander-poc' : '';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('themeMode');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Apply dark-mode class to body and data-theme attribute to document element
    if (mode === 'dark') {
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.removeAttribute('data-theme');
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode(prev => (prev === 'light' ? 'dark' : 'light')),
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#4fc3f7' : '#002d3e', // Cyan in dark, Dark Teal in light
          },
          secondary: {
            main: mode === 'dark' ? '#ffeb3b' : '#ffc107', // Bright Yellow in dark, Deep Yellow in light
          },
          error: {
            main: mode === 'dark' ? '#ef5350' : '#d32f2f', // Bright Red in dark, Deep Red in light
          },
          background: {
            default: mode === 'dark' ? '#002d3e' : '#f0f2f5', // Dark Teal in dark, Off-White in light
            paper: mode === 'dark' ? '#033c4f' : '#ffffff', // Lighter Teal in dark, White in light
          },
          text: {
            primary: mode === 'dark' ? '#e0f7fa' : '#212121', // Light Cyan in dark, Near Black in light
            secondary: mode === 'dark' ? '#b2ebf2' : '#666666',
          },
        },
        typography: {
          fontFamily: '"Roboto Mono", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 600,
            letterSpacing: '0.5px',
          },
          h5: {
            fontWeight: 500,
            letterSpacing: '0.3px',
          },
          h6: {
            fontWeight: 500,
            letterSpacing: '0.2px',
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                ...(mode === 'dark' && {
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 0 10px rgba(79, 195, 247, 0.15)',
                }),
                ...(mode === 'light' && {
                  border: '1px solid rgba(0, 45, 62, 0.08)',
                  boxShadow: '0 2px 8px rgba(0, 45, 62, 0.08), 0 1px 3px rgba(0, 45, 62, 0.06)',
                }),
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                '&.Mui-selected': {
                  backgroundColor: 'transparent',
                  borderLeft: mode === 'dark' ? '3px solid #4fc3f7' : '3px solid #ffc107',
                  background:
                    mode === 'dark'
                      ? 'linear-gradient(90deg, rgba(79, 195, 247, 0.15) 0%, transparent 100%)'
                      : 'rgba(255, 193, 7, 0.1)',
                  '& .MuiListItemIcon-root': {
                    color: mode === 'dark' ? '#ffeb3b' : '#ffeb3b',
                  },
                  '&:hover': {
                    backgroundColor:
                      mode === 'dark' ? 'rgba(79, 195, 247, 0.2)' : 'rgba(255, 193, 7, 0.15)',
                  },
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                ...(mode === 'light' && {
                  backgroundColor: '#002d3e',
                  color: '#ffffff',
                }),
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                ...(mode === 'light' && {
                  backgroundColor: '#002d3e',
                  color: '#ffffff',
                  '& .MuiListItemIcon-root': {
                    color: '#ffffff',
                  },
                  '& .MuiListItemText-root': {
                    color: '#ffffff',
                  },
                  '& .MuiDivider-root': {
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  },
                }),
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router basename={basename}>
          <Layout />
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
