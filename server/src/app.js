const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const pinoHttp = require('pino-http')

const logger = require('./lib/@system/Logger')
const systemRoutes = require('./routes/@system')
const customRoutes = require('./routes/@custom')

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.APP_URL ?? 'http://localhost:5173', credentials: true }))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

if (process.env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }))
}

// Routes
app.use('/api', systemRoutes)
app.use('/api', customRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

// Error handler
app.use((err, req, res, _next) => {
  logger.error({ err, req: { method: req.method, url: req.url } }, err.message ?? 'Internal server error')
  const status = err.status ?? err.statusCode ?? 500
  res.status(status).json({ message: err.message ?? 'Internal server error' })
})

module.exports = app
