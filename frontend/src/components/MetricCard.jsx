import React from 'react'
import { C, F } from '../design.js'

function status(v, lo, hi) {
  if (v === null || v === undefined) return 'none'
  if (v < lo || v > hi) return 'crit'
  const m = (hi - lo) * 0.12
  if (v < lo + m || v > hi - m) return 'warn'
  return 'ok'
}

const ST = {
  ok:   { color: C.ok,   bg: C.okBg,   label: 'Норма'     },
  warn: { color: C.warn, bg: C.warnBg, label: 'Внимание'  },
  crit: { color: C.crit, bg: C.critBg, label: 'Критично'  },
  none: { color: C.textMuted, bg: C.bgAlt, label: 'Нет данных'},
}

export default function MetricCard({ label, value, unit, low, high }) {
  const s = ST[status(value, low, high)]
  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      borderTop: `2px solid ${s.color}`,
      padding: '18px 20px',
      flex: 1,
      minWidth: 170,
    }}>
      <div style={{ fontSize: F.xs, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 10 }}>
        <span style={{ fontSize: F.xxl, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
          {value ?? '—'}
        </span>
        <span style={{ fontSize: F.sm, color: C.textMuted }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: F.xs, fontWeight: 600, color: s.color, background: s.bg, padding: '2px 7px', border: `1px solid ${s.color}30` }}>
          {s.label}
        </span>
        {low != null && <span style={{ fontSize: F.xs, color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{low} – {high}</span>}
      </div>
    </div>
  )
}
