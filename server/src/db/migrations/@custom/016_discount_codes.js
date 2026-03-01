'use strict'

const fs = require('fs')
const path = require('path')

async function up(db) {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../schemas/@custom/discount_codes.sql'),
    'utf8',
  )
  await db.none(sql)
  console.log('[migrate] applied schema: discount_codes')
}

async function down(db) {
  await db.none('DROP TABLE IF EXISTS discount_codes CASCADE')
  console.log('[migrate] rolled back schema: discount_codes')
}

module.exports = { up, down }
