import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = `ws://${window.location.hostname}:4000/ws`

export function useWebSocket(userId) {
  const ws = useRef(null)
  const reconnectTimer = useRef(null)

  const [latest, setLatest] = useState({ heart_rate: null, spo2: null, temperature: null, timestamp: null, device_id: null })
  const [history, setHistory] = useState([])
  const [alerts, setAlerts] = useState([])
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return
    const socket = new WebSocket(`${WS_URL}?user_id=${encodeURIComponent(userId)}`)

    socket.onopen = () => { setConnected(true); clearTimeout(reconnectTimer.current) }

    socket.onmessage = (event) => {
      let msg
      try { msg = JSON.parse(event.data) } catch { return }

      if (msg.type === 'data') {
        const point = {
          time: new Date(msg.data.timestamp).toLocaleTimeString('ru-RU'),
          heart_rate: msg.data.heart_rate,
          spo2: msg.data.spo2,
          temperature: msg.data.temperature
        }
        setLatest({ heart_rate: msg.data.heart_rate, spo2: msg.data.spo2, temperature: msg.data.temperature, timestamp: msg.data.timestamp, device_id: msg.data.device_id })
        setHistory(prev => { const n = [...prev, point]; return n.length > 60 ? n.slice(-60) : n })
      }
      if (msg.type === 'alert') {
        setAlerts(prev => [msg.data, ...prev].slice(0, 100))
      }
    }

    socket.onclose = () => { setConnected(false); reconnectTimer.current = setTimeout(connect, 3000) }
    socket.onerror = () => socket.close()
    ws.current = socket
  }, [userId])

  useEffect(() => {
    connect()
    return () => { clearTimeout(reconnectTimer.current); ws.current?.close() }
  }, [connect])

  return { latest, history, alerts, connected }
}
