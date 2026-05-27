const BOUNDS = {
  heart_rate: [20, 250],
  spo2: [0, 100],
  temperature: [30.0, 45.0],
};

export function validateMessage(msg) {
  if (!msg || typeof msg !== "object")
    return { valid: false, reason: "Not an object" };
  for (const f of [
    "device_id",
    "user_id",
    "timestamp",
    "heart_rate",
    "spo2",
    "temperature",
  ]) {
    if (msg[f] === undefined || msg[f] === null)
      return { valid: false, reason: `Missing: ${f}` };
  }
  if (typeof msg.device_id !== "string" || !msg.device_id.trim())
    return { valid: false, reason: "Invalid device_id" };
  if (typeof msg.user_id !== "string" || !msg.user_id.trim())
    return { valid: false, reason: "Invalid user_id" };
  if (isNaN(Date.parse(msg.timestamp)))
    return { valid: false, reason: "Invalid timestamp" };
  for (const [f, [min, max]] of Object.entries(BOUNDS)) {
    const v = Number(msg[f]);
    if (isNaN(v)) return { valid: false, reason: `${f} not a number` };
    if (v < min || v > max)
      return { valid: false, reason: `${f}=${v} out of [${min},${max}]` };
  }
  return { valid: true };
}
