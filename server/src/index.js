require('dotenv').config()
const app = require('./app')
const logger = require('./lib/@system/Logger')

const PORT = process.env.PORT ?? 4000

app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV ?? 'development' }, 'server started')
})
