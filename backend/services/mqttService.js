import mqtt from "mqtt";
import cfg from "../config.js";
import { validateMessage } from "../middleware/validate.js";
import { writeMetrics } from "./influx.js";
import { checkAlert } from "./alert.js";
import { broadcast } from "./wsManager.js";
import { touch } from "./deviceRegistry.js";

let client = null;

export function start() {
  client = mqtt.connect(cfg.mqttBrokerUrl, {
    clientId: `backend_${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    reconnectPeriod: 3000,
  });

  client.on("connect", () => {
    client.subscribe("health/data/#", { qos: 1 }, (err) => {
      if (err) console.error("[MQTT] Subscribe error:", err.message);
      else console.log("[MQTT] Subscribed: health/data/#");
    });
  });

  client.on("message", async (topic, payload) => {
    let msg;
    try {
      msg = JSON.parse(payload.toString());
    } catch {
      console.warn("[MQTT] JSON parse error");
      return;
    }

    const { valid, reason } = validateMessage(msg);
    if (!valid) {
      console.warn(`[MQTT] Invalid: ${reason}`);
      return;
    }

    try {
      await writeMetrics(msg);
    } catch (e) {
      console.error("[MQTT] InfluxDB error:", e.message);
    }

    touch(msg.device_id);

    const alerts = checkAlert(msg, msg.user_id);
    if (alerts) {
      for (const alert of alerts) {
        console.log(
          `[ALERT] ${alert.user_id} | ${alert.metric}=${alert.value} | ${alert.recommendation?.doctor || "—"}`,
        );
        broadcast(msg.user_id, { type: "alert", data: alert });
      }
    }

    broadcast(msg.user_id, { type: "data", data: msg });
  });

  client.on("error", (e) => console.error("[MQTT] Error:", e.message));
  client.on("reconnect", () => console.log("[MQTT] Reconnecting..."));
}

export const stop = () => client?.end();
