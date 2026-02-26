const jwt = require('jsonwebtoken')
const { promisify } = require('util')

const SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'

// Promisified versions of the jsonwebtoken callback API
const _signAsync = promisify(jwt.sign)
const _verifyAsync = promisify(jwt.verify)

// Access tokens are short-lived; refresh tokens are opaque (not JWT).
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL ?? '15m'

function signToken(payload, options = {}) {
  return jwt.sign(payload, SECRET, { expiresIn: ACCESS_TOKEN_TTL, ...options })
}

function verifyToken(token) {
  return jwt.verify(token, SECRET)
}

async function signTokenAsync(payload, options = {}) {
  return _signAsync(payload, SECRET, { expiresIn: ACCESS_TOKEN_TTL, ...options })
}

async function verifyTokenAsync(token) {
  return _verifyAsync(token, SECRET)
}

// Convenience aliases — semantically clearer when used alongside refresh tokens
const signAccessToken = signToken
const signAccessTokenAsync = signTokenAsync
const verifyAccessToken = verifyToken
const verifyAccessTokenAsync = verifyTokenAsync

module.exports = {
  signToken,
  verifyToken,
  signTokenAsync,
  verifyTokenAsync,
  signAccessToken,
  signAccessTokenAsync,
  verifyAccessToken,
  verifyAccessTokenAsync,
  ACCESS_TOKEN_TTL,
}
