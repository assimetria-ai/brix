process.env.JWT_SECRET = 'test-secret'

const { signToken, verifyToken, signTokenAsync, verifyTokenAsync } = require('../../../src/lib/@system/Helpers/jwt')

describe('JWT helpers', () => {
  const payload = { userId: 42 }

  describe('signToken / verifyToken (sync)', () => {
    it('signs and verifies a token synchronously', () => {
      const token = signToken(payload)
      expect(typeof token).toBe('string')
      const decoded = verifyToken(token)
      expect(decoded.userId).toBe(42)
    })

    it('throws on an invalid token', () => {
      expect(() => verifyToken('not.a.token')).toThrow()
    })
  })

  describe('signTokenAsync / verifyTokenAsync (async)', () => {
    it('signs a token asynchronously', async () => {
      const token = await signTokenAsync(payload)
      expect(typeof token).toBe('string')
    })

    it('verifies a token asynchronously', async () => {
      const token = await signTokenAsync(payload)
      const decoded = await verifyTokenAsync(token)
      expect(decoded.userId).toBe(42)
    })

    it('async sign and sync verify produce compatible tokens', async () => {
      const token = await signTokenAsync(payload)
      const decoded = verifyToken(token)
      expect(decoded.userId).toBe(42)
    })

    it('sync sign and async verify produce compatible tokens', async () => {
      const token = signToken(payload)
      const decoded = await verifyTokenAsync(token)
      expect(decoded.userId).toBe(42)
    })

    it('rejects on an invalid token', async () => {
      await expect(verifyTokenAsync('not.a.token')).rejects.toThrow()
    })

    it('respects custom expiresIn option', async () => {
      const token = await signTokenAsync(payload, { expiresIn: '1s' })
      const decoded = await verifyTokenAsync(token)
      expect(decoded.exp - decoded.iat).toBe(1)
    })
  })
})
