export default {
  port:         Number(process.env.PORT)          || 4000,
  mqttBrokerUrl: process.env.MQTT_BROKER_URL      || 'mqtt://localhost:1883',
  influxUrl:    process.env.INFLUXDB_URL           || 'http://localhost:8086',
  influxToken:  process.env.INFLUXDB_TOKEN         || 'health-super-secret-token',
  influxOrg:    process.env.INFLUXDB_ORG           || 'health_org',
  influxBucket: process.env.INFLUXDB_BUCKET        || 'health',
}
