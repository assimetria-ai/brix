// @custom — Brix product catalog API
const express = require('express')
const router = express.Router()
const { authenticate } = require('../../../lib/@system/Helpers/auth')
const db = require('../../../lib/@system/PostgreSQL')

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// GET /api/catalog/products — list products
router.get('/catalog/products', authenticate, async (req, res, next) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query
    let where = 'WHERE user_id = $1'
    const params = [req.user.id]
    if (status) { where += ` AND status = $${params.push(status)}`  }
    if (search) { where += ` AND (name ILIKE $${params.push('%' + search + '%')} OR sku ILIKE $${params.length})`}

    const products = await db.any(
      `SELECT p.*, (SELECT COUNT(*) FROM product_variants v WHERE v.product_id = p.id) as variant_count
       FROM products p ${where} ORDER BY created_at DESC LIMIT $${params.push(parseInt(limit))} OFFSET $${params.push(parseInt(offset))}`,
      params
    )
    const total = await db.one(`SELECT COUNT(*) FROM products ${where}`, params.slice(0, params.length - 2))
    res.json({ products, total: parseInt(total.count) })
  } catch (err) {
    next(err)
  }
})

// GET /api/catalog/products/:id — get product with variants
router.get('/catalog/products/:id', authenticate, async (req, res, next) => {
  try {
    const product = await db.oneOrNone(
      'SELECT * FROM products WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    if (!product) return res.status(404).json({ message: 'Product not found' })
    const variants = await db.any('SELECT * FROM product_variants WHERE product_id = $1', [product.id])
    res.json({ product: { ...product, variants } })
  } catch (err) {
    next(err)
  }
})

// POST /api/catalog/products — create product
router.post('/catalog/products', authenticate, async (req, res, next) => {
  try {
    const { name, description, price_cents, compare_price_cents, sku, inventory_qty, track_inventory, tags, status } = req.body
    if (!name) return res.status(400).json({ message: 'name is required' })
    if (price_cents == null || price_cents < 0) return res.status(400).json({ message: 'price_cents must be >= 0' })

    let slug = slugify(name)
    const existing = await db.oneOrNone('SELECT id FROM products WHERE user_id = $1 AND slug = $2', [req.user.id, slug])
    if (existing) slug = `${slug}-${Date.now()}`

    const product = await db.one(
      `INSERT INTO products (user_id, name, slug, description, price_cents, compare_price_cents, sku,
        inventory_qty, track_inventory, tags, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW()) RETURNING *`,
      [req.user.id, name.trim(), slug, description || null, price_cents, compare_price_cents || null,
       sku || null, inventory_qty ?? 0, track_inventory !== false, JSON.stringify(tags || []), status || 'draft']
    )
    res.status(201).json({ product })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/catalog/products/:id — update product
router.patch('/catalog/products/:id', authenticate, async (req, res, next) => {
  try {
    const product = await db.oneOrNone('SELECT * FROM products WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const { name, description, price_cents, compare_price_cents, sku, inventory_qty, track_inventory, tags, status } = req.body
    const updated = await db.one(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price_cents = COALESCE($3, price_cents),
        compare_price_cents = COALESCE($4, compare_price_cents),
        sku = COALESCE($5, sku),
        inventory_qty = COALESCE($6, inventory_qty),
        track_inventory = COALESCE($7, track_inventory),
        tags = COALESCE($8, tags),
        status = COALESCE($9, status),
        updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [name || null, description || null, price_cents ?? null, compare_price_cents ?? null,
       sku || null, inventory_qty ?? null, track_inventory ?? null,
       tags ? JSON.stringify(tags) : null, status || null, product.id]
    )
    res.json({ product: updated })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/catalog/products/:id — archive product
router.delete('/catalog/products/:id', authenticate, async (req, res, next) => {
  try {
    const product = await db.oneOrNone('SELECT * FROM products WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
    if (!product) return res.status(404).json({ message: 'Product not found' })
    await db.none('UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2', ['archived', product.id])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// GET /api/catalog/products/:id/variants — list variants
router.get('/catalog/products/:id/variants', authenticate, async (req, res, next) => {
  try {
    const product = await db.oneOrNone('SELECT id FROM products WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
    if (!product) return res.status(404).json({ message: 'Product not found' })
    const variants = await db.any('SELECT * FROM product_variants WHERE product_id = $1', [product.id])
    res.json({ variants })
  } catch (err) {
    next(err)
  }
})

// POST /api/catalog/products/:id/variants — add variant
router.post('/catalog/products/:id/variants', authenticate, async (req, res, next) => {
  try {
    const product = await db.oneOrNone('SELECT id FROM products WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
    if (!product) return res.status(404).json({ message: 'Product not found' })
    const { name, sku, price_cents, inventory_qty, options } = req.body
    if (!name) return res.status(400).json({ message: 'name is required' })
    const variant = await db.one(
      `INSERT INTO product_variants (product_id, name, sku, price_cents, inventory_qty, options, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`,
      [product.id, name, sku || null, price_cents ?? null, inventory_qty ?? 0, JSON.stringify(options || {})]
    )
    res.status(201).json({ variant })
  } catch (err) {
    next(err)
  }
})

// GET /api/catalog/stats — dashboard stats
router.get('/catalog/stats', authenticate, async (req, res, next) => {
  try {
    const [total, active, low, inv] = await Promise.all([
      db.one('SELECT COUNT(*) FROM products WHERE user_id = $1', [req.user.id]),
      db.one("SELECT COUNT(*) FROM products WHERE user_id = $1 AND status = 'active'", [req.user.id]),
      db.one('SELECT COUNT(*) FROM products WHERE user_id = $1 AND track_inventory = true AND inventory_qty <= low_stock_alert AND status != $2', [req.user.id, 'archived']),
      db.one('SELECT COALESCE(SUM(inventory_qty),0) as total FROM products WHERE user_id = $1 AND status != $2', [req.user.id, 'archived']),
    ])
    res.json({
      total_products: parseInt(total.count),
      active_products: parseInt(active.count),
      low_stock_count: parseInt(low.count),
      total_inventory: parseInt(inv.total),
    })
  } catch (err) {
    next(err)
  }
})

// Public storefront endpoints (no auth)
// GET /api/storefront/products — headless storefront API
router.get('/storefront/products', async (req, res, next) => {
  try {
    const { search, limit = 20, offset = 0 } = req.query
    let where = "WHERE status = 'active'"
    const params = []
    if (search) { where += ` AND name ILIKE $${params.push('%' + search + '%')}` }
    const products = await db.any(
      `SELECT id, name, slug, description, price_cents, compare_price_cents, images, tags
       FROM products ${where} ORDER BY created_at DESC
       LIMIT $${params.push(parseInt(limit))} OFFSET $${params.push(parseInt(offset))}`,
      params
    )
    res.json({ products })
  } catch (err) {
    next(err)
  }
})

// GET /api/storefront/products/:slug
router.get('/storefront/products/:slug', async (req, res, next) => {
  try {
    const product = await db.oneOrNone(
      "SELECT id, name, slug, description, price_cents, compare_price_cents, images, tags FROM products WHERE slug = $1 AND status = 'active'",
      [req.params.slug]
    )
    if (!product) return res.status(404).json({ message: 'Not found' })
    const variants = await db.any('SELECT id, name, price_cents, inventory_qty, options FROM product_variants WHERE product_id = $1', [product.id])
    res.json({ product: { ...product, variants } })
  } catch (err) {
    next(err)
  }
})

module.exports = router
