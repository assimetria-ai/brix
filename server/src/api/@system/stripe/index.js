const express = require('express')
const router = express.Router()
const stripe = require('../../lib/@system/Stripe')
const { authenticate } = require('../../lib/@system/Helpers/auth')
const logger = require('../../lib/@system/Logger')

// POST /api/stripe/create-checkout-session
router.post('/stripe/create-checkout-session', authenticate, async (req, res, next) => {
  try {
    const { priceId } = req.body
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL}/app?checkout=success`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      customer_email: req.user.email,
    })
    res.json({ url: session.url })
  } catch (err) {
    next(err)
  }
})

// POST /api/stripe/webhook
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    // @custom — handle events
    logger.info({ eventType: event.type }, 'stripe webhook received')
    res.json({ received: true })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

module.exports = router
