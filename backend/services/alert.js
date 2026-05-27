import { get as getThresholds } from "./thresholds.js";
import { getRecommendation } from "./cdss.js";

const COOLDOWN_MS = 30000;
const lastAlertTime = new Map();

export function checkAlert(data, userId) {
  const p = getThresholds(userId);
  const triggered = [];
  const now = Date.now();

  const checks = [
    {
      metric: "heart_rate",
      value: data.heart_rate,
      low: p.heart_rate_low,
      high: p.heart_rate_high,
    },
    { metric: "spo2", value: data.spo2, low: p.spo2_low, high: p.spo2_high },
    {
      metric: "temperature",
      value: data.temperature,
      low: p.temperature_low,
      high: p.temperature_high,
    },
  ];

  for (const c of checks) {
    if (c.value < c.low || c.value > c.high) {
      const key = `${userId}:${c.metric}`;
      const last = lastAlertTime.get(key) || 0;

      if (now - last < COOLDOWN_MS) continue;

      lastAlertTime.set(key, now);

      const rec = getRecommendation(c.metric, c.value);
      triggered.push({
        metric: c.metric,
        value: c.value,
        low: c.low,
        high: c.high,
        timestamp: data.timestamp,
        device_id: data.device_id,
        user_id: userId,
        severity: rec?.severity || "warning",
        recommendation: rec
          ? { doctor: rec.doctor, reason: rec.reason, urgency: rec.urgency }
          : null,
        clinical_note: rec?.clinical_note || null,
      });
    } else {
      lastAlertTime.delete(`${userId}:${c.metric}`);
    }
  }

  return triggered.length > 0 ? triggered : null;
}
