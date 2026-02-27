const express = require('express')
const router = express.Router()

router.use(require('../../api/@custom/errors'))
router.use(require('../../api/@custom/pages'))
router.use(require('../../api/@custom/pricing'))

module.exports = router