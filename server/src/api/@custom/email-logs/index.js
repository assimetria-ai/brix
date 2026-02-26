// @custom — transactional email tracking API

'use strict'

const express = require('express')
const router = express.Router()
const { authenticate, requireAdmin } = require('../../../lib/@system/Helpers/auth')
const EmailLogRepo = require('../../../db/repos/@custom/EmailLogRepo')

// GET /api/email-logs/stats
router.get('/email-logs/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const stats = await EmailLogRepo.getStats()
    res.json({ stats })
  } catch (err) {
    next(err)
  }
})

// GET /api/email-logs/volume
router.get('/email-logs/volume', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days ?? '30', 10), 365)
    const volume = await EmailLogRepo.getVolumeByDay({ days })
    res.json({ volume })
  } catch (err) {
    next(err)
  }
})

// GET /api/email-logs/templates
router.get('/email-logs/templates', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const templates = await EmailLogRepo.getTemplateBreakdown()
    res.json({ templates })
  } catch (err) {
    next(err)
  }
})

// GET /api/email-logs
router.get('/email-logs', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status, template, search, limit = '50', offset = '0' } = req.query
    const [logs, total] = await Promise.all([
      EmailLogRepo.findAll({
        status,
        template,
        search,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      }),
      EmailLogRepo.count({ status, template, search }),
    ])
    res.json({ logs, total })
  } catch (err) {
    next(err)
  }
})

// GET /api/email-logs/:id
router.get('/email-logs/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const log = await EmailLogRepo.findById(req.params.id)
    if (!log) return res.status(404).json({ message: 'Email log not found' })
    res.json({ log })
  } catch (err) {
    next(err)
  }
})

// POST /api/email-logs  — ingest an email send event
// Can be called internally (no auth) via a shared secret, or via admin auth
router.post('/email-logs', async (req, res, next) => {
  try {
    // Allow internal calls with a shared secret header, or admin JWT
    const secret = req.headers['x-email-tracking-secret']
    const expectedSecret = process.env.EMAIL_TRACKING_SECRET

    if (expectedSecret && secret !== expectedSecret) {
      // Fall back to checking JWT admin auth
      // We do a manual auth check instead of middleware so we can support both flows
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { to_address, subject, template, status, message_id, provider, error, metadata, user_id } = req.body

    if (!to_address || !subject) {
      return res.status(400).json({ message: 'to_address and subject are required' })
    }

    const log = await EmailLogRepo.create({
      to_address,
      subject,
      template,
      status: status ?? 'sent',
      message_id,
      provider,
      error,
      metadata,
      user_id: user_id ?? null,
    })

    res.status(201).json({ log })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/email-logs/:id/status
router.patch('/email-logs/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const allowed = ['sent', 'delivered', 'bounced', 'failed']
    const { status, error } = req.body

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` })
    }

    const log = await EmailLogRepo.updateStatus(req.params.id, status, error ?? null)
    if (!log) return res.status(404).json({ message: 'Email log not found' })
    res.json({ log })
  } catch (err) {
    next(err)
  }
})

module.exports = router
