// @system — scheduler entry point
// Tasks run on a cron schedule. Add @custom tasks below.

const logger = require('../../../lib/@system/Logger')
const customTasks = require('../@custom')

// Example built-in task runner (extend as needed)
function startScheduler() {
  logger.info('[scheduler] started')
  customTasks.forEach((task) => task.start?.())
}

module.exports = { startScheduler }
