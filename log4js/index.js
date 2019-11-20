const log4js = require('log4js')
const log4jsConfig = require('./log4js.config.js')
let logger = Object.create(null)

log4js.configure(log4jsConfig)
logger = log4js.getLogger()
console.$log = console.log.bind(console)
console.$error = console.error.bind(console)
console.$info = console.info.bind(console)
console.log = logger.info.bind(logger)
console.info = logger.info.bind(logger)
console.error = function () {
  logger.error(...arguments)
}

module.exports = logger
