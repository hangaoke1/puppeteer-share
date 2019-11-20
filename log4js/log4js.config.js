const path = require('path')

const config = require('../config')
const isProd = process.env.NODE_ENV === 'production'

const log4js = config.log4js
const logDir = path.resolve(log4js.logDir || './logs/')
const logFilePrefix = log4js.logFilePrefix || 'app'
const pattern = log4js.pattern || '%d{yyyy-MM-dd hh:mm:ss} %p %m%n'
const pm2 = Boolean(log4js.pm2)

function createLog (filename) {
  // 开发模式统一输出到控制台
  if (!isProd) {
    return {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern
      }
    }
  }
  return {
    type: 'dateFile',
    filename: logDir + '/' + filename,
    pattern: 'yyyyMMdd',
    keepFileExt: true,
    layout: {
      type: 'pattern',
      pattern
    }
  }
}
module.exports = {
  pm2,
  pm2InstanceVar: 'INSTANCE_ID',
  appenders: {
    infoLog: createLog(`${logFilePrefix}-out.log`),
    errorLog: createLog(`${logFilePrefix}-error.log`),
    filterInfo: {
      type: 'logLevelFilter',
      appender: 'infoLog',
      level: 'info',
      maxLevel: 'error'
    },
    filterError: {
      type: 'logLevelFilter',
      appender: 'errorLog',
      level: 'error',
      maxLevel: 'error'
    }
  },
  categories: {
    default: {
      appenders: isProd ? ['filterInfo', 'filterError'] : ['filterInfo'],
      level: 'info'
    }
  }
}
