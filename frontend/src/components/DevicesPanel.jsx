import React, { useState, useEffect, useCallback } from "react";
import { C, F } from "../design.js";

const BASE = "/api";

async function apiDevices(userId) {
  const r = await fetch(`${BASE}/devices?user_id=${userId}`);
  return r.json();
}
async function apiCatalog() {
  const r = await fetch(`${BASE}/devices/catalog`);
  return r.json();
}
async function apiAdd(data) {
  const r = await fetch(`${BASE}/devices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}
async function apiDelete(deviceId) {
  await fetch(`${BASE}/devices/${deviceId}`, { method: "DELETE" });
}

const SENSORS_LABEL = {
  heart_rate: "Пульс",
  spo2: "SpO₂",
  temperature: "Температура",
};

const STATUS = {
  true: { color: C.ok, label: "Онлайн" },
  false: { color: C.crit, label: "Офлайн" },
};

function AddDeviceForm({ userId, catalog, onAdded, onCancel }) {
  const manufacturers = Object.keys(catalog);
  const [mfr, setMfr] = useState(manufacturers[0]);
  const [model, setModel] = useState(
    catalog[manufacturers[0]]?.models[0] || "",
  );
  const [label, setLabel] = useState("");
  const [devId, setDevId] = useState(
    `device-${Math.random().toString(36).slice(2, 7)}`,
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const selMfr = (m) => {
    setMfr(m);
    setModel(catalog[m]?.models[0] || "");
  };

  const submit = async () => {
    setSaving(true);
    setErr(null);
    try {
      const result = await apiAdd({
        device_id: devId,
        user_id: userId,
        manufacturer: mfr,
        model,
        label: label || devId,
      });
      if (result.error) throw new Error(result.error);
      onAdded(result);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const iSt = {
    background: C.bgAlt,
    border: `1px solid ${C.border}`,
    padding: "6px 10px",
    fontSize: F.sm,
    color: C.text,
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
  };

  const info = catalog[mfr];

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          background: C.bgAlt,
          borderBottom: `1px solid ${C.border}`,
          fontSize: F.xs,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: C.textSub,
        }}
      >
        Регистрация нового устройства
      </div>
      <div
        style={{
          padding: "16px 14px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: F.xs, color: C.textMuted, marginBottom: 4 }}>
            Производитель
          </div>
          <select
            style={iSt}
            value={mfr}
            onChange={(e) => selMfr(e.target.value)}
          >
            {manufacturers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontSize: F.xs, color: C.textMuted, marginBottom: 4 }}>
            Модель
          </div>
          <select
            style={iSt}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {(catalog[mfr]?.models || []).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontSize: F.xs, color: C.textMuted, marginBottom: 4 }}>
            Название (произвольное)
          </div>
          <input
            style={iSt}
            type="text"
            placeholder={devId}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div>
          <div style={{ fontSize: F.xs, color: C.textMuted, marginBottom: 4 }}>
            Device ID (MQTT-топик)
          </div>
          <input
            style={{
              ...iSt,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: F.xs,
            }}
            type="text"
            value={devId}
            onChange={(e) => setDevId(e.target.value)}
          />
        </div>
      </div>

      {info && (
        <div
          style={{
            margin: "0 14px 14px",
            padding: "10px 12px",
            background: "#EFF6FF",
            border: `1px solid ${C.primary}25`,
            fontSize: F.sm,
          }}
        >
          <div style={{ display: "flex", gap: 24, marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: F.xs, color: C.textMuted }}>
                Датчики:{" "}
              </span>
              <span style={{ fontWeight: 500 }}>
                {info.sensors.map((s) => SENSORS_LABEL[s]).join(", ")}
              </span>
            </div>
            <div>
              <span style={{ fontSize: F.xs, color: C.textMuted }}>
                Подключение:{" "}
              </span>
              <span style={{ fontWeight: 500 }}>{info.connection}</span>
            </div>
          </div>
          <div style={{ fontSize: F.xs, color: C.textSub }}>{info.note}</div>
          <div style={{ marginTop: 8, fontSize: F.xs, color: C.textMuted }}>
            MQTT-топик:{" "}
            <code
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: "#fff",
                padding: "1px 5px",
                border: `1px solid ${C.border}`,
              }}
            >
              health/data/{devId}
            </code>
          </div>
        </div>
      )}

      {err && (
        <div style={{ margin: "0 14px 10px", fontSize: F.xs, color: C.crit }}>
          {err}
        </div>
      )}

      <div
        style={{
          padding: "10px 14px",
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={submit}
          disabled={saving}
          style={{
            border: `1px solid ${C.primary}`,
            background: C.primary,
            color: "#fff",
            padding: "7px 20px",
            fontSize: F.sm,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Сохранение..." : "Зарегистрировать"}
        </button>
        <button
          onClick={onCancel}
          style={{
            border: `1px solid ${C.border}`,
            background: C.bgCard,
            color: C.textSub,
            padding: "7px 16px",
            fontSize: F.sm,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default function DevicesPanel({ userId }) {
  const [devices, setDevices] = useState([]);
  const [catalog, setCatalog] = useState({});
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [devs, cat] = await Promise.all([apiDevices(userId), apiCatalog()]);
    setDevices(Array.isArray(devs) ? devs : []);
    setCatalog(cat || {});
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => load(), 5000);
    return () => clearInterval(t);
  }, [load]);

  const handleAdded = (device) => {
    setDevices((prev) => [
      ...prev.filter((d) => d.device_id !== device.device_id),
      device,
    ]);
    setAdding(false);
  };

  const handleDelete = async (deviceId) => {
    if (!confirm(`Удалить устройство ${deviceId}?`)) return;
    await apiDelete(deviceId);
    setDevices((prev) => prev.filter((d) => d.device_id !== deviceId));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontSize: F.sm, color: C.textSub }}>
            Зарегистрировано устройств:{" "}
            <b style={{ color: C.text }}>{devices.length}</b>
            {devices.filter((d) => d.online).length > 0 && (
              <span style={{ marginLeft: 10, color: C.ok, fontWeight: 600 }}>
                {devices.filter((d) => d.online).length} онлайн
              </span>
            )}
          </span>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            style={{
              border: `1px solid ${C.primary}`,
              background: C.primary,
              color: "#fff",
              padding: "7px 18px",
              fontSize: F.sm,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            + Добавить устройство
          </button>
        )}
      </div>

      {adding && (
        <AddDeviceForm
          userId={userId}
          catalog={catalog}
          onAdded={handleAdded}
          onCancel={() => setAdding(false)}
        />
      )}

      {loading ? (
        <div style={{ padding: 24, color: C.textMuted, fontSize: F.sm }}>
          Загрузка...
        </div>
      ) : devices.length === 0 ? (
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            padding: "40px 20px",
            textAlign: "center",
            color: C.textMuted,
            fontSize: F.sm,
          }}
        >
          Нет зарегистрированных устройств. Добавьте первое устройство.
        </div>
      ) : (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: F.sm,
            }}
          >
            <thead>
              <tr style={{ background: C.bgAlt }}>
                {[
                  "Статус",
                  "Название",
                  "Производитель",
                  "Модель",
                  "Датчики",
                  "MQTT-топик",
                  "Последний сеанс",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontSize: F.xs,
                      fontWeight: 600,
                      color: C.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: `1px solid ${C.border}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map((d, i) => {
                const st = STATUS[d.online];
                const lastSeen = d.last_seen
                  ? new Date(d.last_seen).toLocaleTimeString("ru-RU")
                  : "—";
                return (
                  <tr
                    key={d.device_id}
                    style={{
                      background: i % 2 === 0 ? C.bgCard : "#FAFBFC",
                      borderBottom: `1px solid ${C.borderMid}`,
                    }}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{ width: 7, height: 7, background: st.color }}
                        />
                        <span
                          style={{
                            fontSize: F.xs,
                            fontWeight: 600,
                            color: st.color,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {d.label}
                    </td>
                    <td style={{ padding: "10px 12px", color: C.textSub }}>
                      {d.manufacturer}
                    </td>
                    <td style={{ padding: "10px 12px", color: C.textSub }}>
                      {d.model}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: F.xs,
                        color: C.textSub,
                      }}
                    >
                      {(d.sensors || [])
                        .map((s) => SENSORS_LABEL[s] || s)
                        .join(", ")}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <code
                        style={{
                          fontSize: F.xs,
                          fontFamily: "'JetBrains Mono', monospace",
                          background: C.bgAlt,
                          padding: "2px 6px",
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        {d.mqtt_topic}
                      </code>
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: F.xs,
                        color: C.textMuted,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {lastSeen}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(d.device_id)}
                        style={{
                          border: `1px solid ${C.border}`,
                          background: "transparent",
                          color: C.crit,
                          padding: "3px 10px",
                          fontSize: F.xs,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
        <div
          style={{
            padding: "8px 14px",
            background: C.bgAlt,
            borderBottom: `1px solid ${C.border}`,
            fontSize: F.xs,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: C.textSub,
          }}
        >
          Инструкция по подключению
        </div>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: F.sm }}
        >
          <thead>
            <tr style={{ background: C.bgAlt }}>
              {["Тип устройства", "Метод подключения", "Статус"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "7px 14px",
                    textAlign: "left",
                    fontSize: F.xs,
                    fontWeight: 600,
                    color: C.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [
                "ESP32 (кастомное)",
                "Прямой MQTT — публикация в health/data/{id}",
                C.ok,
                "Поддерживается",
              ],
              [
                "Стандартные BLE-браслеты (GATT)",
                "BLE-MQTT шлюз на Raspberry Pi + python-bleak",
                C.warn,
                "Через шлюз",
              ],
              [
                "Mi Band 5/6/7",
                "BLE-MQTT шлюз + python-xiaomi-ble",
                C.warn,
                "Через шлюз",
              ],
              [
                "Apple Watch",
                "iOS HealthKit API → MQTT-мост",
                C.warn,
                "Через шлюз",
              ],
              [
                "Garmin",
                "Connect IQ SDK → MQTT-публикация",
                C.warn,
                "Через шлюз",
              ],
              [
                "Fitbit",
                "Fitbit Web API → периодический опрос → MQTT",
                C.warn,
                "Через шлюз",
              ],
            ].map(([type, method, color, status], i) => (
              <tr
                key={type}
                style={{
                  background: i % 2 === 0 ? C.bgCard : "#FAFBFC",
                  borderBottom: `1px solid ${C.borderMid}`,
                }}
              >
                <td style={{ padding: "8px 14px", fontWeight: 500 }}>{type}</td>
                <td
                  style={{
                    padding: "8px 14px",
                    color: C.textSub,
                    fontSize: F.xs,
                  }}
                >
                  {method}
                </td>
                <td style={{ padding: "8px 14px" }}>
                  <span style={{ fontSize: F.xs, fontWeight: 600, color }}>
                    {status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
