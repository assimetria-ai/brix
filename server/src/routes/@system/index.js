const express = require('express')
const router = express.Router()

router.use(require('../../api/@system/ping'))
router.use(require('../../api/@system/health'))
router.use(require('../../api/@system/sessions'))
router.use(require('../../api/@system/user'))
router.use(require('../../api/@system/totp'))
router.use(require('../../api/@system/admin'))
router.use(require('../../api/@system/stripe'))
router.use(require('../../api/@system/polar'))
router.use(require('../../api/@system/subscriptions'))
router.use(require('../../api/@system/api-keys'))
router.use(require('../../api/@system/oauth'))
router.use(require('../../api/@system/onboarding'))

module.exports = router
