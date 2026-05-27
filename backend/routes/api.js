import { Router } from "express";
import { queryHistory } from "../services/influx.js";
import {
  get as getThresholds,
  set as setThresholds,
} from "../services/thresholds.js";
import { getRecommendation } from "../services/cdss.js";
import { getConnectionCount } from "../services/wsManager.js";
import * as DevReg from "../services/deviceRegistry.js";

const router = Router();

router.get("/devices", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id required" });
  res.json(DevReg.list(user_id));
});

router.get("/devices/catalog", (req, res) => res.json(DevReg.getCatalog()));

router.get("/devices/:deviceId", (req, res) => {
  const d = DevReg.get(req.params.deviceId);
  if (!d) return res.status(404).json({ error: "Device not found" });
  res.json(d);
});

router.post("/devices", (req, res) => {
  try {
    res.status(201).json(DevReg.register(req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/devices/:deviceId", (req, res) => {
  const existing = DevReg.get(req.params.deviceId);
  if (!existing) return res.status(404).json({ error: "Device not found" });
  try {
    res.json(
      DevReg.register({
        ...existing,
        ...req.body,
        device_id: req.params.deviceId,
      }),
    );
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/devices/:deviceId", (req, res) => {
  const ok = DevReg.remove(req.params.deviceId);
  if (!ok) return res.status(404).json({ error: "Device not found" });
  res.json({ deleted: req.params.deviceId });
});

router.get("/history", async (req, res) => {
  const { user_id, device_id, start_time, end_time, aggregation_window } =
    req.query;
  if (!user_id || !device_id || !start_time || !end_time)
    return res
      .status(400)
      .json({ error: "Required: user_id, device_id, start_time, end_time" });
  if (isNaN(Date.parse(start_time)) || isNaN(Date.parse(end_time)))
    return res
      .status(400)
      .json({ error: "start_time and end_time must be ISO 8601" });
  const VALID = ["1m", "5m", "15m", "1h", "1d"];
  const window = aggregation_window || "1m";
  if (!VALID.includes(window))
    return res
      .status(400)
      .json({ error: `aggregation_window must be: ${VALID.join(", ")}` });
  try {
    res.json(await queryHistory(device_id, start_time, end_time, window));
  } catch (e) {
    res.status(500).json({ error: "InfluxDB query failed", detail: e.message });
  }
});

router.get("/thresholds/:userId", (req, res) =>
  res.json(getThresholds(req.params.userId)),
);
router.put("/thresholds/:userId", (req, res) => {
  if (!req.body || typeof req.body !== "object")
    return res.status(400).json({ error: "Body must be JSON" });
  res.json(setThresholds(req.params.userId, req.body));
});

router.get("/recommend", (req, res) => {
  const { metric, value } = req.query;
  if (!metric || value === undefined)
    return res.status(400).json({ error: "Required: metric, value" });
  const v = Number(value);
  if (isNaN(v))
    return res.status(400).json({ error: "value must be a number" });
  const rec = getRecommendation(metric, v);
  if (!rec)
    return res.json({
      status: "normal",
      message: "Значение в пределах клинической нормы",
    });
  res.json({ status: "alert", ...rec });
});

router.get("/health", (req, res) =>
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    ws_connections: getConnectionCount(),
    devices_registered: DevReg.list("user-abc-123").length,
    timestamp: new Date().toISOString(),
  }),
);

export default router;
