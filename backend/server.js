import http     from 'http'
import express  from 'express'
import cfg      from './config.js'
import apiRouter from './routes/api.js'
import * as wsManager from './services/wsManager.js'
import { start as startMqtt } from './services/mqttService.js'

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
app.use('/api', apiRouter)

const server = http.createServer(app)
wsManager.init(server)

server.listen(cfg.port, () => {
  console.log(`[SERVER] Listening on port ${cfg.port}`)
  setTimeout(() => { startMqtt(); console.log('[SERVER] MQTT started') }, 2000)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
