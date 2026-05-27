const BASE = '/api'

export async function getHistory(userId, deviceId, startTime, endTime, window = '1m') {
  const p = new URLSearchParams({ user_id: userId, device_id: deviceId, start_time: startTime, end_time: endTime, aggregation_window: window })
  const res = await fetch(`${BASE}/history?${p}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getThresholds(userId) {
  const res = await fetch(`${BASE}/thresholds/${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function saveThresholds(userId, thresholds) {
  const res = await fetch(`${BASE}/thresholds/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(thresholds)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
