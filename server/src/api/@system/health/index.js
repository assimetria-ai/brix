// @system — health check endpoint
// Returns 200 when the server + DB are healthy; 503 on degraded state.
const express = require('express')
const router = express.Router()
const db = require('../../../lib/@system/PostgreSQL')
const { isReady: redisReady } = require('../../../lib/@system/Redis')

// GET /api/health
router.get('/health', async (_req, res) => {
  const checks = { server: 'ok', db: 'unknown', redis: 'unknown' }
  let healthy = true

  // DB check
  try {
    await db.one('SELECT 1')
    checks.db = 'ok'
  } catch (err) {
    checks.db = 'error'
    healthy = false
  }

  // Redis check (non-fatal — app degrades gracefully without it)
  checks.redis = redisReady() ? 'ok' : 'unavailable'

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  })
})

module.exports = router
