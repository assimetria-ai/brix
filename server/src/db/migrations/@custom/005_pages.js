'use strict'

const fs = require('fs')
const path = require('path')

async function up(db) {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../schemas/@custom/pages.sql'),
    'utf8',
  )
  await db.none(sql)
  console.log('[migrate] applied schema: pages')
}

async function down(db) {
  await db.none('DROP TABLE IF EXISTS pages CASCADE')
  console.log('[migrate] rolled back schema: pages')
}

module.exports = { up, down }
