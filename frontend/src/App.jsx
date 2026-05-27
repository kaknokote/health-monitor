import React, { useState, useEffect } from "react";
import { useWebSocket } from "./hooks/useWebSocket.js";
import { getThresholds } from "./services/api.js";
import { C, F } from "./design.js";
import MetricCard from "./components/MetricCard.jsx";
import MetricChart from "./components/MetricChart.jsx";
import AlertLog from "./components/AlertLog.jsx";
import ThresholdSettings from "./components/ThresholdSettings.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import DevicesPanel from "./components/DevicesPanel.jsx";

const USER_ID = "user-abc-123";
const DEVICE_ID = "esp32-001";
const TABS = [
  { key: "realtime", label: "Реальное время" },
  { key: "history", label: "История" },
  { key: "alerts", label: "Уведомления" },
  { key: "settings", label: "Пороги" },
  { key: "devices", label: "Устройства" },
];

export default function App() {
  const { latest, history, alerts, connected } = useWebSocket(USER_ID);
  const [thresholds, setThresholds] = useState(null);
  const [tab, setTab] = useState("realtime");

  useEffect(() => {
    getThresholds(USER_ID)
      .then(setThresholds)
      .catch(() =>
        setThresholds({
          heart_rate_low: 60,
          heart_rate_high: 100,
          spo2_low: 95,
          spo2_high: 100,
          temperature_low: 36.0,
          temperature_high: 37.2,
        }),
      );
  }, []);

  const t = thresholds || {};

  const tabBtn = (active) => ({
    padding: "9px 18px",
    border: "none",
    background: "transparent",
    fontSize: F.sm,
    fontWeight: active ? 600 : 400,
    color: active ? C.primary : C.textSub,
    cursor: "pointer",
    fontFamily: "inherit",
    borderBottom: active ? `2px solid ${C.primary}` : "2px solid transparent",
    marginBottom: -1,
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <header
        style={{
          background: C.bgHeader,
          color: "#fff",
          padding: "0 28px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid #374151`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{ fontWeight: 700, fontSize: F.lg, letterSpacing: "-0.2px" }}
          >
            HEALTH MONITOR
          </span>
          <span
            style={{
              fontSize: F.xs,
              color: "#6B7280",
              padding: "2px 6px",
              border: "1px solid #374151",
            }}
          >
            IoT Platform
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {latest.device_id && (
            <span
              style={{
                fontSize: F.xs,
                color: "#6B7280",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {latest.device_id}
            </span>
          )}
          {latest.timestamp && (
            <span
              style={{
                fontSize: F.xs,
                color: "#6B7280",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {new Date(latest.timestamp).toLocaleTimeString("ru-RU")}
            </span>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: F.xs,
              fontWeight: 500,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                background: connected ? "#4ADE80" : "#F87171",
              }}
            />
            <span style={{ color: connected ? "#4ADE80" : "#F87171" }}>
              {connected ? "Connected" : "Reconnecting"}
            </span>
          </div>
        </div>
      </header>

      <div
        style={{
          background: C.bgCard,
          borderBottom: `1px solid ${C.border}`,
          padding: "0 28px",
          display: "flex",
          gap: 0,
        }}
      >
        {TABS.map((tb) => (
          <button
            key={tb.key}
            style={tabBtn(tab === tb.key)}
            onClick={() => setTab(tb.key)}
          >
            {tb.label}
            {tb.key === "alerts" && alerts.length > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: F.xs,
                  fontWeight: 700,
                  color: C.crit,
                }}
              >
                ({alerts.length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {tab === "realtime" && (
          <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <MetricCard
                label="Пульс"
                value={latest.heart_rate}
                unit="уд./мин"
                low={t.heart_rate_low}
                high={t.heart_rate_high}
              />
              <MetricCard
                label="SpO2"
                value={latest.spo2}
                unit="%"
                low={t.spo2_low}
                high={t.spo2_high}
              />
              <MetricCard
                label="Температура"
                value={latest.temperature}
                unit="°C"
                low={t.temperature_low}
                high={t.temperature_high}
              />
              <div
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  padding: "18px 20px",
                  flex: 1,
                  minWidth: 170,
                }}
              >
                <div
                  style={{
                    fontSize: F.xs,
                    fontWeight: 600,
                    color: C.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 10,
                  }}
                >
                  Сеанс
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: F.sm,
                  }}
                >
                  <tbody>
                    {[
                      ["Измерений", history.length],
                      ["Алертов", alerts.length],
                      ["Устройство", DEVICE_ID],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ padding: "3px 0", color: C.textMuted }}>
                          {k}
                        </td>
                        <td
                          style={{
                            padding: "3px 0",
                            fontWeight: 600,
                            color: C.text,
                            textAlign: "right",
                            fontFamily: "'JetBrains Mono',monospace",
                          }}
                        >
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <MetricChart
              title="Пульс (уд./мин)"
              data={history}
              dataKey="heart_rate"
              unit="уд./мин"
              color={C.chartHR}
              low={t.heart_rate_low}
              high={t.heart_rate_high}
              domain={[20, 220]}
            />
            <MetricChart
              title="SpO2 (%)"
              data={history}
              dataKey="spo2"
              unit="%"
              color={C.chartSpO2}
              low={t.spo2_low}
              high={t.spo2_high}
              domain={[70, 100]}
            />
            <MetricChart
              title="Температура тела (°C)"
              data={history}
              dataKey="temperature"
              unit="°C"
              color={C.chartTemp}
              low={t.temperature_low}
              high={t.temperature_high}
              domain={[34, 42]}
            />
          </>
        )}

        {tab === "history" && (
          <HistoryPanel
            userId={USER_ID}
            deviceId={DEVICE_ID}
            thresholds={thresholds}
          />
        )}
        {tab === "alerts" && <AlertLog alerts={alerts} />}
        {tab === "settings" && <ThresholdSettings userId={USER_ID} />}
        {tab === "devices" && <DevicesPanel userId={USER_ID} />}
      </div>
    </div>
  );
}
