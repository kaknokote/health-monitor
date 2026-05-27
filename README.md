# Health Monitor — Интерактивная веб-платформа мониторинга показателей здоровья для IoT-системы

---

## О проекте

Платформа обеспечивает дистанционный мониторинг биометрических показателей здоровья (пульс, SpO₂, температура тела) с IoT-устройств в режиме реального времени. При выходе показателей за допустимые пороговые значения система генерирует уведомление и рекомендует профильного врача-специалиста (CDSS — Clinical Decision Support System) на основе референсных норм ВОЗ и AHA.

## Стек технологий

| Уровень | Технология |
|---|---|
| IoT-устройство | ESP32 + MAX30102 (пульс, SpO₂) + DS18B20 (температура) |
| Брокер сообщений | Eclipse Mosquitto 2.x (MQTT v3.1.1) |
| Серверное приложение | Node.js 20, Express, MQTT.js, ws |
| База данных | InfluxDB 2.7 (time-series) |
| Веб-интерфейс | React 18, Recharts, WebSocket API |
| Контейнеризация | Docker, Docker Compose |

## Архитектура
ESP32 (датчики)
↓ MQTT  health/data/{device_id}
Mosquitto (брокер)
↓ subscribe
Node.js (backend)
├── Валидация V(M_i(t))
├── Запись → InfluxDB
├── Алертизация A(t) + CDSS
└── WebSocket push
↓
React (frontend)
├── Графики реального времени
├── Журнал уведомлений с рекомендациями врача
├── История с агрегацией (Flux)
├── Настройка пороговых значений P(u)
└── Реестр устройств

## Быстрый старт

### Требования
- Docker Desktop (с WSL2 на Windows)
- Node.js 20+ (для симулятора)

### Запуск

```bash
# 1. Клонировать репозиторий
git clone https://github.com/kaknokote/health-monitor.git
cd health-monitor

# 2. Запустить платформу
docker compose up --build

# 3. Запустить симулятор ESP32 (второй терминал)
cd simulator
npm install
node esp32_sim.js
```

Открыть в браузере: **http://localhost:3000**
