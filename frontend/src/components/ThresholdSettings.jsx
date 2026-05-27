import React, { useState, useEffect } from "react";
import { getThresholds, saveThresholds } from "../services/api.js";
import { C, F } from "../design.js";

const DEF = {
  heart_rate_low: 60,
  heart_rate_high: 100,
  spo2_low: 95,
  spo2_high: 100,
  temperature_low: 36.0,
  temperature_high: 37.2,
};
const NORMS = [
  { label: "Пульс", norm: "60 – 100 уд./мин", src: "ВОЗ, AHA" },
  { label: "SpO2", norm: "95 – 100 %", src: "Пульсоксиметрия" },
  { label: "Температура", norm: "36.0 – 37.2 °C", src: "Минздрав РФ" },
];
const GROUPS = [
  {
    title: "Пульс",
    lo: "heart_rate_low",
    hi: "heart_rate_high",
    unit: "уд./мин",
    step: 1,
    norm: "60 – 100",
  },
  {
    title: "SpO2",
    lo: "spo2_low",
    hi: "spo2_high",
    unit: "%",
    step: 1,
    norm: "95 – 100",
  },
  {
    title: "Температура",
    lo: "temperature_low",
    hi: "temperature_high",
    unit: "°C",
    step: 0.1,
    norm: "36.0 – 37.2",
  },
];

const inp = {
  background: C.bgAlt,
  border: `1px solid ${C.border}`,
  padding: "6px 10px",
  fontSize: F.sm,
  color: C.text,
  outline: "none",
  width: 88,
  fontFamily: "'JetBrains Mono', monospace",
};

export default function ThresholdSettings({ userId }) {
  const [vals, setVals] = useState(DEF);
  const [saved, setSaved] = useState(false);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    getThresholds(userId)
      .then((d) => setVals({ ...DEF, ...d }))
      .catch(() => {})
      .finally(() => setLoad(false));
  }, [userId]);

  const ch = (k, v) => {
    setSaved(false);
    setVals((p) => ({ ...p, [k]: Number(v) }));
  };
  const save = async () => {
    await saveThresholds(userId, vals);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const reset = () => {
    setVals(DEF);
    setSaved(false);
  };

  if (load)
    return (
      <div style={{ padding: 24, color: C.textMuted, fontSize: F.sm }}>
        Загрузка...
      </div>
    );

  const btnStyle = (primary) => ({
    border: `1px solid ${primary ? C.primary : C.border}`,
    background: primary ? C.primary : C.bgCard,
    color: primary ? "#fff" : C.textSub,
    padding: "7px 20px",
    fontSize: F.sm,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
          Референсные клинические нормы
        </div>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: F.sm }}
        >
          <thead>
            <tr style={{ background: C.bgAlt }}>
              {["Показатель", "Норма", "Источник"].map((h) => (
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
            {NORMS.map((n, i) => (
              <tr
                key={n.label}
                style={{
                  background: i % 2 === 0 ? C.bgCard : C.bgRow,
                  borderBottom: `1px solid ${C.borderMid}`,
                }}
              >
                <td style={{ padding: "8px 14px", fontWeight: 500 }}>
                  {n.label}
                </td>
                <td
                  style={{
                    padding: "8px 14px",
                    fontFamily: "'JetBrains Mono',monospace",
                    fontWeight: 600,
                    color: C.primary,
                  }}
                >
                  {n.norm}
                </td>
                <td
                  style={{
                    padding: "8px 14px",
                    color: C.textMuted,
                    fontSize: F.xs,
                  }}
                >
                  {n.src}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          Индивидуальные пороговые значения P(u)
        </div>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: F.sm }}
        >
          <thead>
            <tr style={{ background: C.bgAlt }}>
              {["Показатель", "Минимум", "Максимум", "Единица", "Норма"].map(
                (h) => (
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
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g, i) => (
              <tr
                key={g.title}
                style={{
                  background: i % 2 === 0 ? C.bgCard : C.bgRow,
                  borderBottom: `1px solid ${C.borderMid}`,
                }}
              >
                <td style={{ padding: "10px 14px", fontWeight: 500 }}>
                  {g.title}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <input
                    style={inp}
                    type="number"
                    step={g.step}
                    value={vals[g.lo]}
                    onChange={(e) => ch(g.lo, e.target.value)}
                  />
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <input
                    style={inp}
                    type="number"
                    step={g.step}
                    value={vals[g.hi]}
                    onChange={(e) => ch(g.hi, e.target.value)}
                  />
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    color: C.textMuted,
                    fontSize: F.xs,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {g.unit}
                </td>
                <td
                  style={{
                    padding: "10px 14px",
                    color: C.primary,
                    fontSize: F.xs,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontWeight: 500,
                  }}
                >
                  {g.norm}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            padding: "12px 14px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <button style={btnStyle(true)} onClick={save}>
            Сохранить
          </button>
          <button style={btnStyle(false)} onClick={reset}>
            Сбросить к норме
          </button>
          {saved && (
            <span style={{ fontSize: F.xs, fontWeight: 600, color: C.ok }}>
              Сохранено
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
