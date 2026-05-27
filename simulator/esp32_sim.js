import mqtt from "mqtt";

const DEVICE_ID = process.env.DEVICE_ID || "esp32-001";
const USER_ID = process.env.USER_ID || "user-abc-123";
const MQTT_URL = process.env.MQTT_URL || "mqtt://localhost:1883";
const INTERVAL_MS = Number(process.env.INTERVAL_MS) || 1000;
const TOPIC = `health/data/${DEVICE_ID}`;

const state = { heart_rate: 72, spo2: 97, temperature: 36.6, count: 0 };

function rw(cur, base, sigma, min, max, dec = 0) {
  const noise = (Math.random() - 0.5) * 2 * sigma;
  const revert = (base - cur) * 0.05;
  const next = Math.max(min, Math.min(max, cur + noise + revert));
  return dec === 0 ? Math.round(next) : parseFloat(next.toFixed(dec));
}

const ANOMALY_SCENARIOS = [
  {
    name: "Тахикардия",
    fn: () => ({ heart_rate: 125 + Math.round(Math.random() * 30) }),
  },
  {
    name: "Гипоксемия",
    fn: () => ({ spo2: 88 + Math.round(Math.random() * 4) }),
  },
  {
    name: "Лихорадка",
    fn: () => ({ temperature: 38.8 + Math.round(Math.random() * 10) / 10 }),
  },
  {
    name: "Брадикардия",
    fn: () => ({ heart_rate: 45 + Math.round(Math.random() * 10) }),
  },
  {
    name: "Тяжёлая гипокс.",
    fn: () => ({ spo2: 82 + Math.round(Math.random() * 4) }),
  },
];

function generatePayload() {
  state.count++;
  const isAnomaly = state.count % 30 === 0;
  const scenario =
    ANOMALY_SCENARIOS[
      Math.floor((state.count / 30) % ANOMALY_SCENARIOS.length)
    ];

  if (!isAnomaly) {
    state.heart_rate = rw(state.heart_rate, 72, 2, 40, 200);
    state.spo2 = rw(state.spo2, 97, 0.5, 85, 100);
    state.temperature = rw(state.temperature, 36.6, 0.1, 35, 42, 1);
  } else {
    const overrides = scenario.fn();
    Object.assign(state, overrides);
    console.log(`[SIM] ⚠  Anomaly: ${scenario.name} →`, overrides);
  }

  return {
    device_id: DEVICE_ID,
    user_id: USER_ID,
    timestamp: new Date().toISOString(),
    heart_rate: state.heart_rate,
    spo2: state.spo2,
    temperature: state.temperature,
  };
}

const client = mqtt.connect(MQTT_URL, {
  clientId: `sim_${DEVICE_ID}`,
  clean: true,
  reconnectPeriod: 3000,
});

client.on("connect", () => {
  console.log(`[SIM] Connected to ${MQTT_URL}`);
  console.log(`[SIM] Topic: ${TOPIC} | interval: ${INTERVAL_MS}ms`);
  setInterval(() => {
    const p = generatePayload();
    client.publish(TOPIC, JSON.stringify(p), { qos: 1 }, (err) => {
      if (err) console.error("[SIM] Publish error:", err.message);
      else if (state.count % 10 === 0)
        console.log(
          `[SIM] #${state.count} HR=${p.heart_rate} SpO2=${p.spo2} T=${p.temperature}`,
        );
    });
  }, INTERVAL_MS);
});

client.on("error", (e) => console.error("[SIM] Error:", e.message));
