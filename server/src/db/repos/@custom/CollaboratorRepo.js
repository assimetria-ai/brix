const db = require('../../../lib/@system/PostgreSQL')

const CollaboratorRepo = {
  async findAll({ status, role, limit = 50, offset = 0, include_deleted = false } = {}) {
    const conditions = []
    const values = []
    let idx = 1

    if (!include_deleted) conditions.push('deleted_at IS NULL')
    if (status) { conditions.push(`status = $${idx++}`); values.push(status) }
    if (role) { conditions.push(`role = $${idx++}`); values.push(role) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    values.push(limit, offset)

    return db.any(
      `SELECT id, email, name, role, status, invited_by, user_id, accepted_at,
              created_at, updated_at, deleted_at
       FROM collaborators
       ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    )
  },

  async count({ status, role, include_deleted = false } = {}) {
    const conditions = []
    const values = []
    let idx = 1

    if (!include_deleted) conditions.push('deleted_at IS NULL')
    if (status) { conditions.push(`status = $${idx++}`); values.push(status) }
    if (role) { conditions.push(`role = $${idx++}`); values.push(role) }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const row = await db.one(`SELECT COUNT(*) FROM collaborators ${where}`, values)
    return parseInt(row.count, 10)
  },

  async findById(id) {
    return db.oneOrNone('SELECT * FROM collaborators WHERE id = $1 AND deleted_at IS NULL', [id])
  },

  async findByIdIncludingDeleted(id) {
    return db.oneOrNone('SELECT * FROM collaborators WHERE id = $1', [id])
  },

  async findByEmail(email) {
    return db.oneOrNone('SELECT * FROM collaborators WHERE email = $1 AND deleted_at IS NULL', [email])
  },

  async findByUserId(user_id) {
    return db.oneOrNone('SELECT * FROM collaborators WHERE user_id = $1 AND deleted_at IS NULL', [user_id])
  },

  async findByInviteToken(token) {
    return db.oneOrNone('SELECT * FROM collaborators WHERE invite_token = $1 AND deleted_at IS NULL', [token])
  },

  async create({ email, name, role = 'member', invited_by, invite_token }) {
    return db.one(
      `INSERT INTO collaborators (email, name, role, invited_by, invite_token)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, name ?? null, role, invited_by ?? null, invite_token ?? null],
    )
  },

  async accept(id, user_id) {
    return db.oneOrNone(
      `UPDATE collaborators
       SET status = 'active', user_id = $2, accepted_at = now(), updated_at = now(), invite_token = NULL
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id, user_id],
    )
  },

  async updateRole(id, role) {
    return db.oneOrNone(
      `UPDATE collaborators SET role = $2, updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id, role],
    )
  },

  async revoke(id) {
    return db.oneOrNone(
      `UPDATE collaborators SET status = 'revoked', updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    )
  },

  // ── Soft delete ──────────────────────────────────────────────────────────────

  async softDelete(id) {
    return db.oneOrNone(
      `UPDATE collaborators SET deleted_at = now(), updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    )
  },

  async restore(id) {
    return db.oneOrNone(
      `UPDATE collaborators SET deleted_at = NULL, updated_at = now()
       WHERE id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id],
    )
  },

  async findDeleted({ limit = 50, offset = 0 } = {}) {
    return db.any(
      `SELECT id, email, name, role, status, user_id, created_at, updated_at, deleted_at
       FROM collaborators
       WHERE deleted_at IS NOT NULL
       ORDER BY deleted_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
  },

  // ── Hard delete (permanent) ──────────────────────────────────────────────────

  async hardDelete(id) {
    return db.oneOrNone('DELETE FROM collaborators WHERE id = $1 RETURNING id', [id])
  },

  /** @deprecated Alias for softDelete — use softDelete() explicitly */
  async delete(id) {
    return this.softDelete(id)
  },

  async search(query, { limit = 20 } = {}) {
    return db.any(
      `SELECT id, email, name, role, status, user_id, created_at,
              ts_rank(
                to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(email, '')),
                plainto_tsquery('simple', $1)
              ) AS rank
       FROM collaborators
       WHERE deleted_at IS NULL
         AND to_tsvector('simple', COALESCE(name, '') || ' ' || COALESCE(email, ''))
             @@ plainto_tsquery('simple', $1)
       ORDER BY rank DESC
       LIMIT $2`,
      [query, limit],
    )
  },
}

module.exports = CollaboratorRepo
