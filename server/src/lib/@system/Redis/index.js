const Redis = require('ioredis')
const logger = require('../Logger')

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const client = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
})

client.on('connect', () => logger.info('Redis connected'))
client.on('error', (err) => logger.error({ err }, 'Redis error'))
client.on('close', () => logger.warn('Redis connection closed'))

/**
 * Connect eagerly. Called from index.js at startup.
 * Resolves even if Redis is unavailable — app continues degraded.
 */
async function connect() {
  try {
    await client.connect()
  } catch (err) {
    logger.warn({ err }, 'Redis unavailable — running without Redis cache')
  }
}

/** True once the client has successfully connected at least once */
function isReady() {
  return client.status === 'ready'
}

module.exports = { client, connect, isReady }
