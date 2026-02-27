const systemInfo = require('../@system/info')

const customInfo = {
  name: 'Brix',
  url: process.env.APP_URL ?? 'https://getbrix.com',
  description: 'No-code page builder. Product in. Store out.',
}

module.exports = { ...systemInfo, ...customInfo }