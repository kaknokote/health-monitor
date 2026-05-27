import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { C, F } from '../design.js'

const Tip = ({ active, payload, label, unit, color }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '7px 12px', fontSize: F.sm, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ color: C.textMuted, fontSize: F.xs, marginBottom: 3 }}>{label}</div>
      <div style={{ color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{payload[0].value} <span style={{ fontWeight: 400, fontSize: F.xs }}>{unit}</span></div>
    </div>
  )
}

export default function MetricChart({ title, data, dataKey, unit, color, low, high, domain }) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, padding: '14px 16px 10px' }}>
      <div style={{ fontSize: F.xs, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{title}</div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 2, right: 6, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={C.borderMid} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: C.textMuted }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }} tickLine={false} axisLine={false} domain={domain || ['auto','auto']} width={34} />
          <Tooltip content={<Tip unit={unit} color={color} />} />
          {low  != null && <ReferenceLine y={low}  stroke={C.warn} strokeDasharray="4 4" strokeWidth={1} label={{ value: `${low}`, fontSize: 9, fill: C.warn, position: 'insideTopLeft' }} />}
          {high != null && <ReferenceLine y={high} stroke={C.crit} strokeDasharray="4 4" strokeWidth={1} label={{ value: `${high}`, fontSize: 9, fill: C.crit, position: 'insideTopRight' }} />}
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
