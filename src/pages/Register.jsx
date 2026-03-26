/**
 * pages/Register.jsx — CashCompass Registration Page
 *
 * Split-screen matching Login branding:
 *   Left  → CashCompass branding panel
 *   Right → Registration form (username, email, password, confirm)
 */
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Stack, Alert,
  CircularProgress, Paper, Divider,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import { register } from '../utils/api';

// ── CashCompass palette ────────────────────────────────────────────────────────
const CC = {
  primary:      '#1E3A8A', // Navy Blue
  primaryDark:  '#111827', // Dark
  primaryLight: '#DBEAFE', // Light Blue
  accent:       '#10B981', // Emerald Green
  white:        '#FFFFFF',
};

const BULLETS = [
  'Free to sign up — no card required',
  'Secure, password-protected account',
  'Start tracking finances immediately',
  'Full dashboard from day one',
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.password, form.email);
      showToast('Account created! Redirecting to login…', 'success', 'Welcome to CashCompass!');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Toast toast={toast} onClose={hideToast} />

      {/* ── Left branding panel ── */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '42%',
        background: 'rgba(11, 15, 25, 0.4)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        p: 6,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <AccountBalanceWalletIcon sx={{ color: CC.accent, fontSize: 52 }} />
          <Typography variant="h3" fontWeight={900} sx={{ color: CC.white, letterSpacing: -1 }}>
            CashCompass
          </Typography>
        </Box>

        <Box sx={{ width: 60, height: 3, bgcolor: CC.accent, borderRadius: 2, mb: 3 }} />

        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', mb: 4, lineHeight: 1.6 }}>
          Join thousands managing their<br />finances the smart way.
        </Typography>

        <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 300 }}>
          {BULLETS.map((b) => (
            <Stack key={b} direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CC.accent, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{b}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ── Right registration form ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        p: { xs: 3, sm: 6 },
      }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 440, borderRadius: 3, p: { xs: 3, sm: 4 } }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 3 }}>
            <AccountBalanceWalletIcon sx={{ color: CC.primary, fontSize: 30 }} />
            <Typography variant="h6" fontWeight={800} color={CC.primary}>CashCompass</Typography>
          </Box>

          {/* Header */}
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
            <Box sx={{ p: 1, bgcolor: 'rgba(59, 130, 246, 0.15)', borderRadius: 2 }}>
              <LockIcon sx={{ color: CC.primary, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color={CC.primary}>Create Account</Typography>
              <Typography variant="caption" color="text.secondary">Start your CashCompass journey</Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                name="username" label="Username" fullWidth size="small"
                value={form.username} onChange={handleChange} required autoFocus
                slotProps={{ input: { startAdornment: <PersonIcon sx={{ mr: 1, color: CC.primary, fontSize: 20 }} /> } }}
                sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: CC.primary } }}
              />
              <TextField
                name="email" label="Email" type="email" fullWidth size="small"
                value={form.email} onChange={handleChange} required
                slotProps={{ input: { startAdornment: <EmailIcon sx={{ mr: 1, color: CC.primary, fontSize: 20 }} /> } }}
                sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: CC.primary } }}
              />
              <TextField
                name="password" label="Password" type="password" fullWidth size="small"
                value={form.password} onChange={handleChange} required
                slotProps={{ input: { startAdornment: <LockIcon sx={{ mr: 1, color: CC.primary, fontSize: 20 }} /> } }}
                sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: CC.primary } }}
              />
              <TextField
                name="confirm" label="Confirm Password" type="password" fullWidth size="small"
                value={form.confirm} onChange={handleChange} required
                slotProps={{ input: { startAdornment: <LockIcon sx={{ mr: 1, color: CC.primary, fontSize: 20 }} /> } }}
                sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: CC.primary } }}
              />
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}
                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>
                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Create Account'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            Already have an account?{' '}
            <RouterLink to="/login"
              style={{ color: CC.primary, fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </RouterLink>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
