const { createLogger, format, transports } = require('winston')

const prettyPrintConsoleFormat = format.printf(info => `${info.timestamp} ${info.level}: ${info.message} ${info.metadata ? JSON.stringify(info.metadata, null, 4) : ''}`)
const consoleFormat = format.printf(info => `${info.timestamp} ${info.level}: ${info.message} ${info.metadata ? JSON.stringify(info.metadata) : ''}`)

let consoleTransport = new transports.Console({
  prettyPrint: true,
  json: true,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.colorize(),
    consoleFormat
  )
})

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    format.json()
  ),
  transports: [
    /*
    new transports.File({
      filename: 'error.log',
      level: 'error',
      maxsize: 50 * 1024 * 1024, // 50 MB
      maxFiles: 5
    }),

    new transports.File({
      filename: 'app.log',
      maxsize: 50 * 1024 * 1024, // 50 MB
      maxFiles: 5
    })
    */
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(consoleTransport)
}

logger.setPrettyPrint = function (prettyPrint = false) {
  logger.debug(`setPrettyPrint(${prettyPrint})`)
  const logFormat = prettyPrint ? prettyPrintConsoleFormat : consoleFormat

  if (process.env.NODE_ENV !== 'production') {
    logger.remove(consoleTransport)
    consoleTransport = new transports.Console({
      prettyPrint: true,
      json: true,
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.colorize(),
        logFormat
      )
    })
    logger.add(consoleTransport)
  }
}

module.exports = logger
