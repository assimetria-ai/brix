const express = require('express')
const router = express.Router()
const db = require('../../lib/@system/PostgreSQL')

router.get('/health', async (req, res) => {
  const timestamp = new Date().toISOString()
  const uptime = Math.floor(process.uptime())
  const environment = process.env.NODE_ENV || 'unknown'

  try {
    await db.one('SELECT 1')
    res.json({
      status: 'ok',
      timestamp,
      uptime,
      environment,
      db: 'connected'
    })
  } catch (err) {
    res.status(503).json({
      status: 'error',
      timestamp,
      uptime,
      environment,
      db: 'disconnected',
      message: err.message
    })
  }
})

module.exports = router
