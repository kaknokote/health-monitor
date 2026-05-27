const ONLINE_TIMEOUT_MS = 10000;

const registry = new Map();

export const CATALOG = {
  "Custom ESP32": {
    models: ["ESP32 + MAX30102 + DS18B20", "ESP32 + MAX30102", "ESP32 DevKit"],
    sensors: ["heart_rate", "spo2", "temperature"],
    connection: "Wi-Fi / MQTT",
    note: "Кастомное устройство на базе ESP32. Требует прошивки с поддержкой MQTT.",
  },
  Xiaomi: {
    models: ["Mi Band 7", "Mi Band 6", "Mi Band 5", "Mi Smart Band 8"],
    sensors: ["heart_rate", "spo2"],
    connection: "BLE → MQTT-шлюз",
    note: "Подключение через BLE-MQTT шлюз (Raspberry Pi + python-xiaomi-ble).",
  },
  Apple: {
    models: [
      "Apple Watch Series 9",
      "Apple Watch Series 8",
      "Apple Watch Ultra 2",
    ],
    sensors: ["heart_rate", "spo2", "temperature"],
    connection: "HealthKit API → MQTT",
    note: "Подключение через iOS-приложение с HealthKit API, публикующее данные в MQTT.",
  },
  Garmin: {
    models: ["Garmin Venu 3", "Garmin Forerunner 965", "Garmin Fenix 7"],
    sensors: ["heart_rate", "spo2"],
    connection: "Connect IQ SDK → MQTT",
    note: "Подключение через приложение Connect IQ, публикующее данные в MQTT.",
  },
  Fitbit: {
    models: ["Fitbit Charge 6", "Fitbit Sense 2", "Fitbit Versa 4"],
    sensors: ["heart_rate", "spo2", "temperature"],
    connection: "Fitbit Web API → MQTT",
    note: "Подключение через Fitbit Web API с периодическим опросом и публикацией в MQTT.",
  },
  "Generic BLE": {
    models: ["GATT Heart Rate Profile", "H Band", "VeryFit Compatible"],
    sensors: ["heart_rate"],
    connection: "BLE GATT → MQTT-шлюз",
    note: "Стандартные BLE-устройства с профилем Heart Rate Service (UUID 0x180D). Работают с любым GATT-шлюзом.",
  },
};

export function register(deviceData) {
  const { device_id, user_id, manufacturer, model, label } = deviceData;
  if (!device_id || !user_id)
    throw new Error("device_id and user_id are required");

  const existing = registry.get(device_id) || {};
  registry.set(device_id, {
    device_id,
    user_id,
    manufacturer: manufacturer || "Custom ESP32",
    model: model || "ESP32 + MAX30102 + DS18B20",
    label: label || device_id,
    sensors: CATALOG[manufacturer]?.sensors || [
      "heart_rate",
      "spo2",
      "temperature",
    ],
    connection: CATALOG[manufacturer]?.connection || "MQTT",
    note: CATALOG[manufacturer]?.note || "",
    mqtt_topic: `health/data/${device_id}`,
    registered_at: existing.registered_at || new Date().toISOString(),
    last_seen: existing.last_seen || null,
  });

  return registry.get(device_id);
}

export function touch(device_id) {
  if (registry.has(device_id)) {
    registry.get(device_id).last_seen = new Date().toISOString();
  } else {
    registry.set(device_id, {
      device_id,
      user_id: "user-abc-123",
      manufacturer: "Custom ESP32",
      model: "ESP32 + MAX30102 + DS18B20",
      label: device_id,
      sensors: ["heart_rate", "spo2", "temperature"],
      connection: "Wi-Fi / MQTT",
      note: "Зарегистрировано автоматически при первом подключении.",
      mqtt_topic: `health/data/${device_id}`,
      registered_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    });
  }
}

export function isOnline(device_id) {
  const d = registry.get(device_id);
  if (!d?.last_seen) return false;
  return Date.now() - new Date(d.last_seen).getTime() < ONLINE_TIMEOUT_MS;
}

export function list(user_id) {
  return [...registry.values()]
    .filter((d) => d.user_id === user_id)
    .map((d) => ({ ...d, online: isOnline(d.device_id) }));
}

export function get(device_id) {
  const d = registry.get(device_id);
  if (!d) return null;
  return { ...d, online: isOnline(device_id) };
}

export function remove(device_id) {
  return registry.delete(device_id);
}

export const getCatalog = () => CATALOG;
