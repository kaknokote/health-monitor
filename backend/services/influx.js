import { InfluxDB, Point } from "@influxdata/influxdb-client";
import cfg from "../config.js";

const client = new InfluxDB({ url: cfg.influxUrl, token: cfg.influxToken });
const writeApi = client.getWriteApi(cfg.influxOrg, cfg.influxBucket, "ms");
const queryApi = client.getQueryApi(cfg.influxOrg);

export function writeMetrics(msg) {
  const p = new Point("health_metrics")
    .tag("device_id", msg.device_id)
    .tag("user_id", msg.user_id)
    .intField("heart_rate", msg.heart_rate)
    .intField("spo2", msg.spo2)
    .floatField("temperature", msg.temperature)
    .timestamp(new Date(msg.timestamp));
  writeApi.writePoint(p);
  return writeApi.flush();
}

export function queryHistory(deviceId, startTime, endTime, aggWindow) {
  const fluxQuery = `
    from(bucket: "${cfg.influxBucket}")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r._measurement == "health_metrics")
      |> filter(fn: (r) => r.device_id == "${deviceId}")
      |> filter(fn: (r) => r._field == "heart_rate" or r._field == "spo2" or r._field == "temperature")
      |> aggregateWindow(every: ${aggWindow}, fn: mean, createEmpty: false)
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> map(fn: (r) => ({ r with timestamp: string(v: r._time) }))
      |> keep(columns: ["timestamp", "heart_rate", "spo2", "temperature"])
      |> sort(columns: ["timestamp"])
  `;
  return new Promise((resolve, reject) => {
    const rows = [];
    queryApi.queryRows(fluxQuery, {
      next(row, meta) {
        const o = meta.toObject(row);
        rows.push({
          timestamp: o.timestamp,
          heart_rate: o.heart_rate != null ? Math.round(o.heart_rate) : null,
          spo2: o.spo2 != null ? Math.round(o.spo2) : null,
          temperature:
            o.temperature != null ? Math.round(o.temperature * 10) / 10 : null,
        });
      },
      error: reject,
      complete: () => resolve(rows),
    });
  });
}
