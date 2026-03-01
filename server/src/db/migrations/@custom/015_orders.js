'use strict'

const fs = require('fs')
const path = require('path')

async function up(db) {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../schemas/@custom/orders.sql'),
    'utf8',
  )
  await db.none(sql)
  console.log('[migrate] applied schema: orders')
}

async function down(db) {
  await db.none('DROP TABLE IF EXISTS orders CASCADE')
  console.log('[migrate] rolled back schema: orders')
}

module.exports = { up, down }
