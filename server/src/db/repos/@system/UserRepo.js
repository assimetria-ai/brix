const db = require('../../../lib/@system/PostgreSQL')

const UserRepo = {
  async findById(id) {
    return db.oneOrNone('SELECT * FROM users WHERE id = $1', [id])
  },

  async verifyEmail(userId) {
    return db.oneOrNone(
      'UPDATE users SET email_verified_at = now(), updated_at = now() WHERE id = $1 RETURNING id, email, name, role, email_verified_at',
      [userId]
    )
  },

  async findByEmail(email) {
    return db.oneOrNone('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
  },

  async findAll() {
    return db.any('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC')
  },

  async create({ email, name, password_hash, role = 'user' }) {
    return db.one(
      'INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [email.toLowerCase(), name, password_hash, role],
    )
  },

  async update(id, fields) {
    const sets = Object.entries(fields)
      .filter(([, v]) => v !== undefined)
      .map(([k], i) => `${k} = $${i + 2}`)
      .join(', ')
    const values = Object.values(fields).filter((v) => v !== undefined)
    if (!sets) return this.findById(id)
    return db.one(`UPDATE users SET ${sets}, updated_at = now() WHERE id = $1 RETURNING id, email, name, role`, [id, ...values])
  },

  async search(query, { limit = 20 } = {}) {
    return db.any(
      `SELECT id, email, name, role, created_at,
              ts_rank(
                to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(email, '')),
                plainto_tsquery('simple', $1)
              ) AS rank
       FROM users
       WHERE to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(email, ''))
             @@ plainto_tsquery('simple', $1)
       ORDER BY rank DESC
       LIMIT $2`,
      [query, limit],
    )
  },

  /**
   * Create a user that authenticated via OAuth (no password).
   * email and name may be null if the provider does not expose them.
   */
  async createOAuth({ email, name, role = 'user' }) {
    return db.one(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $2, NULL, $3)
       RETURNING *`,
      [email ? email.toLowerCase() : null, name ?? null, role],
    )
  },

  async findByStripeCustomerId(stripeCustomerId) {
    return db.oneOrNone('SELECT * FROM users WHERE stripe_customer_id = $1', [stripeCustomerId])
  },

  async updateStripeCustomerId(userId, stripeCustomerId) {
    return db.oneOrNone(
      'UPDATE users SET stripe_customer_id = $2, updated_at = now() WHERE id = $1 RETURNING id, email, name, role, stripe_customer_id',
      [userId, stripeCustomerId],
    )
  },
}

module.exports = UserRepo
