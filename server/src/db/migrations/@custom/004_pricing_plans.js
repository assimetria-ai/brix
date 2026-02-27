'use strict'

const fs = require('fs')
const path = require('path')

/**
 * Migration 004: Create pricing_plans table
 */
async function up(db) {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../schemas/@custom/pricing_plans.sql'),
    'utf8',
  )
  await db.none(sql)
  console.log('[migrate] applied schema: pricing_plans')
}

async function down(db) {
  await db.none('DROP TABLE IF EXISTS pricing_plans CASCADE')
  console.log('[migrate] rolled back schema: pricing_plans')
}

module.exports = { up, down }
