'use strict'

const fs = require('fs')
const path = require('path')

exports.up = async (db) => {
  const sql = fs.readFileSync(
    path.join(__dirname, '../../schemas/@custom/api_keys.sql'),
    'utf8',
  )
  await db.none(sql)
  console.log('[003_api_keys] applied schema: api_keys')
}

exports.down = async (db) => {
  await db.none('DROP TABLE IF EXISTS api_keys CASCADE')
  console.log('[003_api_keys] rolled back: api_keys')
}
