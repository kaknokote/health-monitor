import React, { useState } from 'react'
import { getHistory } from '../services/api.js'
import MetricChart from './MetricChart.jsx'
import { C, F } from '../design.js'

const fmt = d => d.toISOString().slice(0,16)

export default function HistoryPanel({ userId, deviceId, thresholds }) {
  const now = new Date()
  const [start, setStart] = useState(fmt(new Date(now-3600000)))
  const [end,   setEnd]   = useState(fmt(now))
  const [win,   setWin]   = useState('1m')
  const [data,  setData]  = useState([])
  const [load,  setLoad]  = useState(false)
  const [err,   setErr]   = useState(null)

  const go = async () => {
    setLoad(true); setErr(null)
    try {
      const rows = await getHistory(userId, deviceId, new Date(start).toISOString(), new Date(end).toISOString(), win)
      setData(rows.map(r => ({ time: new Date(r.timestamp).toLocaleTimeString('ru-RU'), heart_rate: r.heart_rate, spo2: r.spo2, temperature: r.temperature })))
    } catch(e) { setErr(e.message) }
    finally { setLoad(false) }
  }

  const t   = thresholds || {}
  const iSt = { background:C.bgAlt, border:`1px solid ${C.border}`, padding:'6px 10px', fontSize:F.sm, color:C.text, outline:'none', fontFamily:'inherit' }
  const bSt = { border:`1px solid ${C.primary}`, background: load ? C.bgAlt : C.primary, color: load ? C.textMuted : '#fff', padding:'6px 18px', fontSize:F.sm, fontWeight:600, cursor:load?'not-allowed':'pointer', fontFamily:'inherit' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}` }}>
        <div style={{ padding:'8px 14px', background:C.bgAlt, borderBottom:`1px solid ${C.border}`, fontSize:F.xs, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:C.textSub }}>
          Исторические данные
        </div>
        <div style={{ padding:'12px 14px', display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div>
            <div style={{ fontSize:F.xs, color:C.textMuted, marginBottom:4 }}>Начало</div>
            <input style={iSt} type="datetime-local" value={start} onChange={e=>setStart(e.target.value)}/>
          </div>
          <div>
            <div style={{ fontSize:F.xs, color:C.textMuted, marginBottom:4 }}>Конец</div>
            <input style={iSt} type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)}/>
          </div>
          <div>
            <div style={{ fontSize:F.xs, color:C.textMuted, marginBottom:4 }}>Окно агрегации (Δw)</div>
            <select style={iSt} value={win} onChange={e=>setWin(e.target.value)}>
              <option value="1m">1 минута</option>
              <option value="5m">5 минут</option>
              <option value="15m">15 минут</option>
              <option value="1h">1 час</option>
              <option value="1d">1 день</option>
            </select>
          </div>
          <button style={bSt} onClick={go} disabled={load}>{load ? 'Загрузка...' : 'Загрузить'}</button>
        </div>
        {err && <div style={{ padding:'0 14px 12px', fontSize:F.sm, color:C.crit }}>{err}</div>}
      </div>
      {data.length > 0 && <>
        <MetricChart title="Пульс (уд./мин)" data={data} dataKey="heart_rate" unit="уд./мин" color={C.chartHR} low={t.heart_rate_low} high={t.heart_rate_high} domain={[20,220]}/>
        <MetricChart title="SpO2 (%)" data={data} dataKey="spo2" unit="%" color={C.chartSpO2} low={t.spo2_low} high={t.spo2_high} domain={[70,100]}/>
        <MetricChart title="Температура тела (°C)" data={data} dataKey="temperature" unit="°C" color={C.chartTemp} low={t.temperature_low} high={t.temperature_high} domain={[34,42]}/>
      </>}
    </div>
  )
}
