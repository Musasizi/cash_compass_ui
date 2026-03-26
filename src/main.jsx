import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';
import { CssBaseline, ThemeProvider, createTheme, alpha } from '@mui/material';

/**
 * CASH COMPASS THEME
 *
 * Modern Dark Mode Aesthetic
 * Primary: Electric Blue (#3B82F6)
 * Secondary/Accent: Neon Emerald (#10B981)
 * Background: Deep Slate (#0B0F19)
 */
const cashCompassTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6',   // Electric Blue
      dark: '#2563EB',
      light: '#60A5FA',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981',   // Emerald Green
      dark: '#059669',
      light: '#34D399',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0B0F19', // Deep dark slate
      paper: '#111827',   // Slightly lighter slate for cards
    },
    error: { main: '#EF4444' },
    success: { main: '#10B981' },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 16, // Softer, modern corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove default MUI overlay
          backgroundColor: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B82F6',
          },
        },
        notchedOutline: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={cashCompassTheme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  </React.StrictMode>
);
