import React, { useState, useMemo } from "react";
import { C, F } from "../design.js";

const MLABELS = {
  heart_rate: "Пульс",
  spo2: "SpO2",
  temperature: "Температура",
};
const MUNITS = { heart_rate: "уд./мин", spo2: "%", temperature: "°C" };

const SEV = {
  critical: { color: C.crit, bg: C.critBg, label: "КРИТИЧНО" },
  warning: { color: C.warn, bg: C.warnBg, label: "ВНИМАНИЕ" },
};

const URG = {
  asap: { color: C.crit, label: "Срочно" },
  urgent: { color: C.warn, label: "24 ч" },
  routine: { color: C.textSub, label: "Плановый" },
};

function Th({ label, col, sort, setSort, width }) {
  const active = sort.col === col;
  return (
    <th
      onClick={() =>
        setSort({ col, dir: active && sort.dir === "asc" ? "desc" : "asc" })
      }
      style={{
        padding: "8px 10px",
        fontSize: F.xs,
        fontWeight: 600,
        color: active ? C.primary : C.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        textAlign: "left",
        cursor: "pointer",
        width,
        borderBottom: `2px solid ${active ? C.primary : C.border}`,
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label} {active ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}
    </th>
  );
}

export default function AlertLog({ alerts }) {
  const [sort, setSort] = useState({ col: "timestamp", dir: "desc" });
  const [filterSev, setFilterSev] = useState("all");
  const [filterMetric, setFilterMetric] = useState("all");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    let list = [...alerts];
    if (filterSev !== "all")
      list = list.filter((a) => a.severity === filterSev);
    if (filterMetric !== "all")
      list = list.filter((a) => a.metric === filterMetric);
    list.sort((a, b) => {
      let va = a[sort.col],
        vb = b[sort.col];
      if (typeof va === "string")
        ((va = va.toLowerCase()), (vb = vb?.toLowerCase() ?? ""));
      return sort.dir === "asc" ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
    });
    return list;
  }, [alerts, sort, filterSev, filterMetric]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const rows = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const selStyle = {
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    padding: "5px 8px",
    fontSize: F.sm,
    color: C.text,
    cursor: "pointer",
    outline: "none",
    fontFamily: "inherit",
  };

  if (!alerts.length)
    return (
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
        Отклонений не обнаружено
      </div>
    );

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}` }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 14px",
          borderBottom: `1px solid ${C.border}`,
          alignItems: "center",
          flexWrap: "wrap",
          background: C.bgAlt,
        }}
      >
        <span
          style={{
            fontSize: F.xs,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: C.textSub,
            marginRight: 4,
          }}
        >
          Журнал уведомлений — {filtered.length} из {alerts.length}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: F.xs, color: C.textMuted }}>Серьёзность:</span>
        <select
          style={selStyle}
          value={filterSev}
          onChange={(e) => {
            setFilterSev(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">Все</option>
          <option value="critical">Критично</option>
          <option value="warning">Внимание</option>
        </select>
        <span style={{ fontSize: F.xs, color: C.textMuted }}>Показатель:</span>
        <select
          style={selStyle}
          value={filterMetric}
          onChange={(e) => {
            setFilterMetric(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">Все</option>
          <option value="heart_rate">Пульс</option>
          <option value="spo2">SpO2</option>
          <option value="temperature">Температура</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: F.sm }}
        >
          <thead style={{ background: C.bgAlt }}>
            <tr>
              <Th
                label="Время"
                col="timestamp"
                sort={sort}
                setSort={setSort}
                width={130}
              />
              <Th
                label="Показатель"
                col="metric"
                sort={sort}
                setSort={setSort}
                width={110}
              />
              <Th
                label="Значение"
                col="value"
                sort={sort}
                setSort={setSort}
                width={100}
              />
              <Th
                label="Диапазон"
                col="low"
                sort={sort}
                setSort={setSort}
                width={110}
              />
              <Th
                label="Статус"
                col="severity"
                sort={sort}
                setSort={setSort}
                width={100}
              />
              <Th
                label="Врач"
                col="doctor"
                sort={sort}
                setSort={setSort}
                width={200}
              />
              <Th
                label="Срочность"
                col="urgency"
                sort={sort}
                setSort={setSort}
                width={90}
              />
              <th
                style={{ width: 28, borderBottom: `2px solid ${C.border}` }}
              />
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => {
              const sev = SEV[a.severity] || SEV.warning;
              const urg = URG[a.recommendation?.urgency] || URG.routine;
              const unit = MUNITS[a.metric] || "";
              const time = new Date(a.timestamp).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });
              const date = new Date(a.timestamp).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
              });
              const isExp = expanded === page * PER_PAGE + i;
              const idx = page * PER_PAGE + i;

              return (
                <React.Fragment key={idx}>
                  <tr
                    style={{
                      background: i % 2 === 0 ? C.bgCard : C.bgRow,
                      borderBottom: `1px solid ${C.borderMid}`,
                      cursor: "pointer",
                    }}
                    onClick={() => setExpanded(isExp ? null : idx)}
                  >
                    <td
                      style={{
                        padding: "7px 10px",
                        color: C.textSub,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: F.xs,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div>{time}</div>
                      <div style={{ color: C.textMuted }}>{date}</div>
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        fontWeight: 500,
                        color: C.text,
                      }}
                    >
                      {MLABELS[a.metric] || a.metric}
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        color: sev.color,
                      }}
                    >
                      {typeof a.value === "number"
                        ? parseFloat(a.value.toFixed(2))
                        : a.value}
                      <span
                        style={{
                          fontSize: F.xs,
                          fontWeight: 400,
                          color: C.textMuted,
                        }}
                      >
                        {unit}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: F.xs,
                        color: C.textSub,
                      }}
                    >
                      [{a.low}, {a.high}] {unit}
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      <span
                        style={{
                          fontSize: F.xs,
                          fontWeight: 700,
                          color: sev.color,
                          background: sev.bg,
                          padding: "2px 6px",
                          border: `1px solid ${sev.color}30`,
                        }}
                      >
                        {sev.label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        color: C.text,
                        fontSize: F.xs,
                      }}
                    >
                      {a.recommendation?.doctor || "—"}
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      <span
                        style={{
                          fontSize: F.xs,
                          fontWeight: 600,
                          color: urg.color,
                        }}
                      >
                        {urg.label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "7px 8px",
                        color: C.textMuted,
                        fontSize: F.xs,
                        textAlign: "center",
                      }}
                    >
                      {isExp ? "▲" : "▼"}
                    </td>
                  </tr>

                  {isExp && (
                    <tr
                      style={{
                        background: "#EFF6FF",
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <td colSpan={8} style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 16,
                            fontSize: F.sm,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: F.xs,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: C.primary,
                                marginBottom: 4,
                              }}
                            >
                              Рекомендованный специалист
                            </div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: C.text,
                                marginBottom: 4,
                              }}
                            >
                              {a.recommendation?.doctor || "Нет данных"}
                            </div>
                            <div style={{ color: C.textSub, lineHeight: 1.5 }}>
                              {a.recommendation?.reason}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: F.xs,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: C.textMuted,
                                marginBottom: 4,
                              }}
                            >
                              Клиническая справка
                            </div>
                            <div style={{ color: C.textSub, lineHeight: 1.5 }}>
                              {a.clinical_note || "—"}
                            </div>
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: F.xs,
                                color: C.textMuted,
                              }}
                            >
                              Устройство: {a.device_id}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderTop: `1px solid ${C.border}`,
            background: C.bgAlt,
          }}
        >
          <span style={{ fontSize: F.xs, color: C.textMuted }}>
            {page * PER_PAGE + 1}–
            {Math.min((page + 1) * PER_PAGE, filtered.length)} из{" "}
            {filtered.length}
          </span>
          <div style={{ flex: 1 }} />
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                padding: "3px 8px",
                border: `1px solid ${i === page ? C.primary : C.border}`,
                background: i === page ? C.primary : C.bgCard,
                color: i === page ? "#fff" : C.textSub,
                fontSize: F.xs,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: i === page ? 600 : 400,
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
