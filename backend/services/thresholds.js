const DEFAULTS = {
  heart_rate_low: 60,
  heart_rate_high: 100,
  spo2_low: 95,
  spo2_high: 100,
  temperature_low: 36.0,
  temperature_high: 37.2,
};
const store = new Map();
export const get = (userId) =>
  store.has(userId) ? { ...store.get(userId) } : { ...DEFAULTS };
export const set = (userId, t) => {
  const v = {};
  for (const [k, val] of Object.entries(t)) {
    const n = Number(val);
    if (!isNaN(n)) v[k] = n;
  }
  store.set(userId, { ...DEFAULTS, ...v });
  return get(userId);
};
