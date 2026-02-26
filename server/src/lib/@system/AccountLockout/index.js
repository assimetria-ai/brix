// @system — account lockout after repeated failed login attempts
// Uses Redis for tracking. Degrades gracefully when Redis is unavailable.

const { client: redis, isReady: redisReady } = require('../Redis')

const LOCKOUT_PREFIX = 'auth:lockout:'
const ATTEMPTS_PREFIX = 'auth:attempts:'

/** Maximum consecutive failures before the account is locked */
const MAX_ATTEMPTS = 5

/** Lockout window in seconds (also the sliding window for attempts) */
const LOCKOUT_TTL = 15 * 60 // 15 minutes

/**
 * Returns the number of seconds remaining on the lockout, or 0 if not locked.
 */
async function getLockoutSecondsRemaining(email) {
  if (!redisReady()) return 0
  try {
    const ttl = await redis.ttl(`${LOCKOUT_PREFIX}${email}`)
    return ttl > 0 ? ttl : 0
  } catch {
    return 0
  }
}

/**
 * Increments the failed-attempts counter for the email.
 * Locks the account when MAX_ATTEMPTS is reached.
 */
async function incrementFailedAttempts(email) {
  if (!redisReady()) return
  try {
    const key = `${ATTEMPTS_PREFIX}${email}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, LOCKOUT_TTL)
    if (count >= MAX_ATTEMPTS) {
      await redis.set(`${LOCKOUT_PREFIX}${email}`, '1', 'EX', LOCKOUT_TTL)
    }
  } catch {
    // Redis unavailable — skip lockout tracking, degrade gracefully
  }
}

/**
 * Returns current failed-attempt count. Returns null if Redis is unavailable.
 */
async function getFailedAttemptCount(email) {
  if (!redisReady()) return null
  try {
    const val = await redis.get(`${ATTEMPTS_PREFIX}${email}`)
    return val ? parseInt(val, 10) : 0
  } catch {
    return null
  }
}

/**
 * Clears failed-attempt counter and any active lockout for the email.
 * Call this on successful authentication.
 */
async function clearFailedAttempts(email) {
  if (!redisReady()) return
  try {
    await redis.del(`${ATTEMPTS_PREFIX}${email}`, `${LOCKOUT_PREFIX}${email}`)
  } catch {
    // ignore
  }
}

module.exports = {
  MAX_ATTEMPTS,
  LOCKOUT_TTL,
  getLockoutSecondsRemaining,
  incrementFailedAttempts,
  getFailedAttemptCount,
  clearFailedAttempts,
}
