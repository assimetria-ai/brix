// @custom — Brix discount codes API
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../../lib/@system/Helpers/auth')
const db = require('../../../lib/@system/PostgreSQL')

// GET /api/discounts — list discount codes
router.get('/discounts', authenticate, async (req, res, next) => {
  try {
    const codes = await db.any(
      'SELECT * FROM discount_codes WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json({ codes })
  } catch (err) {
    next(err)
  }
})

// POST /api/discounts — create discount code
router.post('/discounts', authenticate, async (req, res, next) => {
  try {
    const { code, type, value, min_order_cents, max_uses, expires_at } = req.body
    if (!code || !type || value == null) {
      return res.status(400).json({ message: 'code, type, and value are required' })
    }
    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({ message: 'type must be percentage or fixed' })
    }
    if (type === 'percentage' && (value <= 0 || value > 100)) {
      return res.status(400).json({ message: 'percentage value must be 1–100' })
    }

    const disc = await db.one(
      `INSERT INTO discount_codes (user_id, code, type, value, min_order_cents, max_uses, expires_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *`,
      [req.user.id, code.toUpperCase().trim(), type, value, min_order_cents || 0, max_uses || null, expires_at || null]
    )
    res.status(201).json({ code: disc })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Discount code already exists' })
    next(err)
  }
})

// PATCH /api/discounts/:id — toggle active / update
router.patch('/discounts/:id', authenticate, async (req, res, next) => {
  try {
    const disc = await db.oneOrNone('SELECT * FROM discount_codes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
    if (!disc) return res.status(404).json({ message: 'Discount code not found' })
    const { active, max_uses, expires_at } = req.body
    const updated = await db.one(
      `UPDATE discount_codes SET
        active = COALESCE($1, active),
        max_uses = COALESCE($2, max_uses),
        expires_at = COALESCE($3, expires_at),
        updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [active ?? null, max_uses ?? null, expires_at || null, disc.id]
    )
    res.json({ code: updated })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/discounts/:id
router.delete('/discounts/:id', authenticate, async (req, res, next) => {
  try {
    const disc = await db.oneOrNone('SELECT id FROM discount_codes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
    if (!disc) return res.status(404).json({ message: 'Discount code not found' })
    await db.none('DELETE FROM discount_codes WHERE id = $1', [disc.id])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// POST /api/discounts/validate — validate a code (public, for checkout)
router.post('/discounts/validate', async (req, res, next) => {
  try {
    const { code, subtotal_cents, user_id } = req.body
    if (!code) return res.status(400).json({ message: 'code is required' })

    const disc = await db.oneOrNone(
      "SELECT * FROM discount_codes WHERE code = $1 AND active = true AND (expires_at IS NULL OR expires_at > NOW()) AND (max_uses IS NULL OR uses_count < max_uses)",
      [code.toUpperCase().trim()]
    )
    if (!disc) return res.status(404).json({ valid: false, message: 'Invalid or expired code' })
    if (disc.min_order_cents > 0 && subtotal_cents < disc.min_order_cents) {
      return res.json({ valid: false, message: `Minimum order of $${(disc.min_order_cents / 100).toFixed(2)} required` })
    }

    const discount_cents = disc.type === 'percentage'
      ? Math.floor((subtotal_cents || 0) * (parseFloat(disc.value) / 100))
      : parseInt(disc.value) * 100

    res.json({ valid: true, code: disc.code, type: disc.type, value: disc.value, discount_cents })
  } catch (err) {
    next(err)
  }
})

module.exports = router
