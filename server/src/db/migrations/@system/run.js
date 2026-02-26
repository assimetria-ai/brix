'use strict'

/**
 * Production Database Migration Runner
 *
 * Tracks applied migrations in a `schema_migrations` table.
 * Discovers migration files from:
 *   - db/migrations/@system/*.js  (platform-level, in-order)
 *   - db/migrations/@custom/*.js  (product-level, in-order)
 *
 * Skips files that are not versioned migration modules (e.g. this file itself).
 *
 * Usage:
 *   node src/db/migrations/@system/run.js           # apply all pending
 *   node src/db/migrations/@system/run.js --dry-run # list pending without applying
 *   node src/db/migrations/@system/run.js --status  # show applied/pending status
 */

require('dotenv').config()

const path = require('path')
const fs = require('fs')
const db = require('../../lib/@system/PostgreSQL')

// ─── Constants ────────────────────────────────────────────────────────────────

const MIGRATIONS_TABLE = 'schema_migrations'

// Files inside this runner's own directory that are not migration modules
const EXCLUDED_FILES = new Set(['run.js', 'index.js'])

// Directories to scan for migration files, in resolution order
const MIGRATION_DIRS = [
  path.join(__dirname, '../@system'),
  path.join(__dirname, '../@custom'),
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString()
  console.log(`[migrate][${ts}] ${msg}`)
}

function err(msg) {
  const ts = new Date().toISOString()
  console.error(`[migrate][${ts}] ERROR: ${msg}`)
}

/**
 * Collect all migration files from MIGRATION_DIRS.
 * Returns an array of { name, filePath } sorted by name ascending.
 * Each `name` is unique across dirs; if duplicates exist the first dir wins.
 */
function discoverMigrations() {
  const seen = new Set()
  const migrations = []

  for (const dir of MIGRATION_DIRS) {
    if (!fs.existsSync(dir)) continue

    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.js') && !EXCLUDED_FILES.has(f))
      .sort() // lexicographic order; use numeric prefix like 001_, 002_ for ordering

    for (const file of files) {
      if (seen.has(file)) {
        log(`WARN: duplicate migration name "${file}" – keeping first occurrence, skipping ${dir}/${file}`)
        continue
      }
      seen.add(file)
      migrations.push({ name: file, filePath: path.join(dir, file) })
    }
  }

  // Final sort in case files came from multiple dirs with interleaved names
  migrations.sort((a, b) => a.name.localeCompare(b.name))
  return migrations
}

// ─── DB bootstrap ─────────────────────────────────────────────────────────────

async function ensureMigrationsTable() {
  await db.none(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL UNIQUE,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}

async function getAppliedMigrations() {
  const rows = await db.any(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY name ASC`)
  return new Set(rows.map(r => r.name))
}

async function recordMigration(name) {
  await db.none(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`, [name])
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function runMigration(migration) {
  const mod = require(migration.filePath)

  if (typeof mod.run === 'function') {
    // Legacy single-function style
    await mod.run(db)
  } else if (typeof mod.up === 'function') {
    // Standard up/down style
    await mod.up(db)
  } else if (typeof mod === 'function') {
    // Direct export style
    await mod(db)
  } else {
    throw new Error(
      `Migration "${migration.name}" does not export a run(), up(), or default function.`
    )
  }
}

async function applyPending(migrations, applied, dryRun = false) {
  const pending = migrations.filter(m => !applied.has(m.name))

  if (pending.length === 0) {
    log('No pending migrations – database is up to date.')
    return 0
  }

  log(`Found ${pending.length} pending migration(s):`)
  pending.forEach(m => log(`  - ${m.name}`))

  if (dryRun) {
    log('[dry-run] Skipping execution.')
    return 0
  }

  let applied_count = 0
  for (const migration of pending) {
    log(`Applying: ${migration.name}`)
    try {
      await runMigration(migration)
      await recordMigration(migration.name)
      log(`Applied:  ${migration.name} ✓`)
      applied_count++
    } catch (error) {
      err(`Failed on "${migration.name}": ${error.message}`)
      err('Aborting migration run. Fix the error and re-run.')
      throw error
    }
  }

  log(`Migration run complete. Applied ${applied_count} migration(s).`)
  return applied_count
}

async function printStatus(migrations, applied) {
  log('Migration status:')
  log('─'.repeat(60))
  if (migrations.length === 0) {
    log('  No migration files found.')
    return
  }
  for (const m of migrations) {
    const status = applied.has(m.name) ? '✓ applied' : '○ pending'
    log(`  [${status}]  ${m.name}`)
  }
  log('─'.repeat(60))
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const statusOnly = args.includes('--status')

  log(`Environment: ${process.env.NODE_ENV ?? 'development'}`)
  log(`Database:    ${(process.env.DATABASE_URL ?? '').replace(/:\/\/.*@/, '://<credentials>@')}`)

  try {
    await ensureMigrationsTable()
    log(`Migrations table "${MIGRATIONS_TABLE}" ready.`)

    const migrations = discoverMigrations()
    log(`Discovered ${migrations.length} migration file(s).`)

    const applied = await getAppliedMigrations()
    log(`Already applied: ${applied.size}`)

    if (statusOnly) {
      await printStatus(migrations, applied)
      process.exit(0)
    }

    await applyPending(migrations, applied, dryRun)
    process.exit(0)
  } catch (error) {
    err(error.message)
    if (error.stack) console.error(error.stack)
    process.exit(1)
  }
}

main()
