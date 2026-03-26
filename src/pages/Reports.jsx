/**
 * pages/Reports.jsx — CashCompass Finance Analytics
 *
 * Shows:
 *  • Income vs Expense grouped bar chart (monthly)
 *  • Income breakdown by type (donut)
 *  • Expense breakdown by type (donut)
 *  • Summary stats table
 */
import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, Stack, Card, CardContent, CardHeader,
  Grid, CircularProgress, Divider, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { getDashboard } from '../utils/api';

// ── Palette ───────────────────────────────────────────────────────────────────
const CC = { primary: '#3B82F6', green: '#10B981', red: '#EF4444' };

const fmt = (n) =>
  Number(n ?? 0).toLocaleString('en-UG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const isoMonthStart = () => {
  const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10);
};
const isoToday = () => new Date().toISOString().slice(0, 10);

// ── Component ─────────────────────────────────────────────────────────────────
export default function Reports({ token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [from,    setFrom]    = useState(isoMonthStart());
  const [to,      setTo]      = useState(isoToday());

  const load = useCallback(() => {
    setLoading(true);
    getDashboard(token, { from, to })
      .then((res) => setData(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, from, to]);

  useEffect(() => { load(); }, [load]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const incomeBreakdown  = data?.incomeBreakdown  ?? [];
  const expenseBreakdown = data?.expenseBreakdown ?? [];
  const balance          = data?.balance          ?? {};

  const totalIncome  = incomeBreakdown.reduce((s, r)  => s + Number(r.total), 0);
  const totalExpense = expenseBreakdown.reduce((s, r) => s + Number(r.total), 0);
  const netBalance   = totalIncome - totalExpense;

  // Bar chart: income vs expense per type side-by-side
  const barCategories = [
    ...new Set([
      ...incomeBreakdown.map((r)  => r.name ?? r.type_name ?? '?'),
      ...expenseBreakdown.map((r) => r.name ?? r.type_name ?? '?'),
    ]),
  ];
  const incomeBar  = barCategories.map((cat) => {
    const row = incomeBreakdown.find((r) => (r.name ?? r.type_name) === cat);
    return row ? Number(row.total) : 0;
  });
  const expenseBar = barCategories.map((cat) => {
    const row = expenseBreakdown.find((r) => (r.name ?? r.type_name) === cat);
    return row ? Number(row.total) : 0;
  });

  const barOptions = {
    theme:   { mode: 'dark' },
    chart:   { type: 'bar', background: 'transparent', toolbar: { show: false } },
    colors:  [CC.green, CC.red],
    xaxis:   { categories: barCategories, labels: { style: { colors: '#94A3B8' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis:   { labels: { formatter: (v) => `${(v / 1000).toFixed(0)}K`, style: { colors: '#94A3B8' } } },
    grid:    { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
    tooltip: { theme: 'dark', y: { formatter: (v) => `UGX ${fmt(v)}` } },
    dataLabels: { enabled: false },
    legend:  { position: 'top', labels: { colors: '#94A3B8' } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
  };

  // Income donut
  const iSeries = incomeBreakdown.map((r)  => Number(r.total));
  const iLabels = incomeBreakdown.map((r)  => r.name ?? r.type_name ?? '?');
  const eSeries = expenseBreakdown.map((r) => Number(r.total));
  const eLabels = expenseBreakdown.map((r) => r.name ?? r.type_name ?? '?');

  const donutOpts = (labels, colors) => ({
    theme:      { mode: 'dark' },
    chart:      { type: 'donut', background: 'transparent', toolbar: { show: false } },
    labels,
    colors,
    stroke:     { show: false },
    legend:     { position: 'bottom', fontSize: '12px', labels: { colors: '#94A3B8' } },
    dataLabels: { enabled: true, formatter: (v) => `${v.toFixed(1)}%` },
    plotOptions: { pie: { donut: { size: '65%' } } },
    tooltip:    { theme: 'dark', y: { formatter: (v) => `UGX ${fmt(v)}` } },
  });

  return (
    <Box>
      {/* Header + Date Filter */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={CC.primary}>Reports</Typography>
          <Typography variant="body2" color="text.secondary">Finance analytics overview</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField type="date" size="small" label="From" value={from}
            onChange={(e) => setFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
          <TextField type="date" size="small" label="To" value={to}
            onChange={(e) => setTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ width: 150 }} />
          <Button variant="outlined" size="small" onClick={load}
            sx={{ borderColor: CC.primary, color: CC.primary, textTransform: 'none' }}>Apply</Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: CC.primary }} /></Box>
      ) : (
        <Grid container spacing={3}>

          {/* Summary stats */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Summary</Typography>} />
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: CC.primary }}>
                    <TableRow>
                      {['Metric', 'Value'].map((h) => (
                        <TableCell key={h} sx={{ color: '#fff', fontWeight: 700 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ['Total Income',   fmt(totalIncome),  CC.green],
                      ['Total Expense',  fmt(totalExpense), CC.red],
                      ['Net Balance',    fmt(netBalance),   netBalance >= 0 ? CC.green : CC.red],
                      ['Live Balance',   fmt(balance.amount_balance), CC.primary],
                    ].map(([label, value, color]) => (
                      <TableRow key={label} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{label}</TableCell>
                        <TableCell sx={{ fontWeight: 800, color }}>UGX {value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Bar chart */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Income vs Expense by Type</Typography>} />
              <Divider />
              <CardContent>
                {barCategories.length > 0 ? (
                  <ReactApexChart
                    type="bar"
                    series={[{ name: 'Income', data: incomeBar }, { name: 'Expense', data: expenseBar }]}
                    options={barOptions}
                    height={300}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>No data for selected period</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Donut charts */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Income Breakdown</Typography>} />
              <Divider />
              <CardContent>
                {iSeries.length > 0 ? (
                  <ReactApexChart type="donut" series={iSeries}
                    options={donutOpts(iLabels, ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'])}
                    height={260} />
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>No data</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardHeader title={<Typography variant="subtitle1" fontWeight={700}>Expense Breakdown</Typography>} />
              <Divider />
              <CardContent>
                {eSeries.length > 0 ? (
                  <ReactApexChart type="donut" series={eSeries}
                    options={donutOpts(eLabels, ['#EF4444', '#F43F5E', '#D946EF', '#8B5CF6', '#3B82F6'])}
                    height={260} />
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={5}>No data</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}
Reports.propTypes = { token: PropTypes.string.isRequired };
