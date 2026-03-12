import React from 'react';
import { useApp } from '../context/AppContext';

// ─── Custom Tooltip wrapper ──────────────────────────────────────────────────
// Reads the current theme from context so it always looks correct in both
// dark mode and light mode.
export function useTooltipStyle() {
  const { state } = useApp();
  const dark = state.theme === 'dark';
  return {
    background: dark ? '#1e1e2e' : '#ffffff',
    border: `1px solid ${dark ? '#333355' : '#ddddf0'}`,
    borderRadius: 8,
    fontSize: 12,
    color: dark ? '#e8e8f0' : '#1a1a2e',
    boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.12)',
  };
}

// Custom Tooltip component for Recharts — use as <Tooltip content={<ChartTooltip />} />
export function ChartTooltip({ active, payload, label }) {
  const { state } = useApp();
  const dark = state.theme === 'dark';

  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{
      background: dark ? '#1e1e2e' : '#ffffff',
      border: `1px solid ${dark ? '#333355' : '#ddddf0'}`,
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
      color: dark ? '#e8e8f0' : '#1a1a2e',
      boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.12)',
      fontFamily: 'Syne, sans-serif',
    }}>
      {label && (
        <p style={{ marginBottom: 6, fontWeight: 700, color: dark ? '#e8e8f0' : '#1a1a2e' }}>
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: dark ? '#9999bb' : '#555570' }}>{entry.name}:</span>
          <strong style={{ color: dark ? '#e8e8f0' : '#1a1a2e' }}>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}
