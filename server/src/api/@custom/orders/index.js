// @custom — Brix order management API
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../../lib/@system/Helpers/auth')
const db = require('../../../lib/@system/PostgreSQL')

function generateOrderNumber() {
  return 'BX-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
}

// GET /api/orders — list orders
router.get('/orders', authenticate, async (req, res, next) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query
    let where = 'WHERE user_id = $1'
    const params = [req.user.id]
    if (status) { where += ` AND status = $${params.push(status)}` }
    if (search) {
      where += ` AND (customer_email ILIKE $${params.push('%' + search + '%')} OR customer_name ILIKE $${params.length} OR order_number ILIKE $${params.length})`
    }
    const orders = await db.any(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${params.push(parseInt(limit))} OFFSET $${params.push(parseInt(offset))}`,
      params
    )
    const total = await db.one(`SELECT COUNT(*) FROM orders ${where}`, params.slice(0, params.length - 2))
    res.json({ orders, total: parseInt(total.count) })
  } catch (err) {
    next(err)
  }
})

// GET /api/orders/:id
router.get('/orders/:id', authenticate, async (req, res, next) => {
  try {
    const order = await db.oneOrNone('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json({ order })
  } catch (err) {
    next(err)
  }
})

// POST /api/orders — create order (from storefront or manual)
router.post('/orders', authenticate, async (req, res, next) => {
  try {
    const { customer_email, customer_name, line_items, shipping_address, discount_code, notes, currency } = req.body
    if (!customer_email) return res.status(400).json({ message: 'customer_email is required' })
    if (!line_items || !Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ message: 'line_items must be a non-empty array' })
    }

    const subtotal_cents = line_items.reduce((sum, item) => sum + (item.price_cents * item.qty), 0)
    let discount_cents = 0

    if (discount_code) {
      const disc = await db.oneOrNone(
        "SELECT * FROM discount_codes WHERE user_id = $1 AND code = $2 AND active = true AND (expires_at IS NULL OR expires_at > NOW()) AND (max_uses IS NULL OR uses_count < max_uses)",
        [req.user.id, discount_code.toUpperCase()]
      )
      if (disc) {
        discount_cents = disc.type === 'percentage'
          ? Math.floor(subtotal_cents * (parseFloat(disc.value) / 100))
          : Math.min(parseInt(disc.value) * 100, subtotal_cents)
        await db.none('UPDATE discount_codes SET uses_count = uses_count + 1 WHERE id = $1', [disc.id])
      }
    }

    const total_cents = Math.max(0, subtotal_cents - discount_cents)
    const order_number = generateOrderNumber()

    const order = await db.one(
      `INSERT INTO orders (user_id, order_number, customer_email, customer_name, line_items, shipping_address,
        subtotal_cents, discount_cents, total_cents, currency, discount_code, notes, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'pending',NOW(),NOW()) RETURNING *`,
      [req.user.id, order_number, customer_email, customer_name || null,
       JSON.stringify(line_items), JSON.stringify(shipping_address || {}),
       subtotal_cents, discount_cents, total_cents, currency || 'usd',
       discount_code || null, notes || null]
    )
    res.status(201).json({ order })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/orders/:id — update status or notes
router.patch('/orders/:id', authenticate, async (req, res, next) => {
  try {
    const order = await db.oneOrNone('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const { status, notes, shipping_address } = req.body
    const VALID_STATUSES = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded']
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` })
    }

    const fulfilled_at = status === 'fulfilled' ? 'NOW()' : null
    const updated = await db.one(
      `UPDATE orders SET
        status = COALESCE($1, status),
        notes = COALESCE($2, notes),
        shipping_address = COALESCE($3, shipping_address),
        fulfilled_at = CASE WHEN $4 IS NOT NULL AND $4::boolean THEN NOW() ELSE fulfilled_at END,
        updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [status || null, notes || null, shipping_address ? JSON.stringify(shipping_address) : null,
       status === 'fulfilled' ? true : null, order.id]
    )
    res.json({ order: updated })
  } catch (err) {
    next(err)
  }
})

// GET /api/orders/stats — order dashboard stats
router.get('/orders/stats', authenticate, async (req, res, next) => {
  try {
    const [pending, today, revenue, fulfillment] = await Promise.all([
      db.one("SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status = 'pending'", [req.user.id]),
      db.one("SELECT COUNT(*) FROM orders WHERE user_id = $1 AND created_at > NOW() - INTERVAL '24 hours'", [req.user.id]),
      db.one("SELECT COALESCE(SUM(total_cents),0) as total FROM orders WHERE user_id = $1 AND status IN ('paid','fulfilled')", [req.user.id]),
      db.one("SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status = 'fulfilled'", [req.user.id]),
    ])
    res.json({
      pending_orders: parseInt(pending.count),
      orders_today: parseInt(today.count),
      total_revenue_cents: parseInt(revenue.total),
      fulfilled_orders: parseInt(fulfillment.count),
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
