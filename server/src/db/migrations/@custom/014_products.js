'use strict'

const fs = require('fs')
const path = require('path')

async function up(db) {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../schemas/@custom/products.sql'),
    'utf8',
  )
  await db.none(sql)
  console.log('[migrate] applied schema: products')
}

async function down(db) {
  await db.none('DROP TABLE IF EXISTS product_variants CASCADE')
  await db.none('DROP TABLE IF EXISTS products CASCADE')
  console.log('[migrate] rolled back schema: products')
}

module.exports = { up, down }
