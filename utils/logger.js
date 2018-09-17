const config = require('../config');
const path = require('path');
const winston = require('winston');
const today = new Date();
const dd = today.getDate();
const mm = today.getMonth() + 1; //January is 0!
const yyyy = today.getFullYear();

const logFile = `${config.logsDirectory}/icons-info-${mm}-${dd}-${yyyy}.log`;

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      colorize: true,
      timestamp: true,
    }),
    new winston.transports.File({
      name: 'info-file',
      filename: path.resolve(logFile),
      level: 'verbose',
      timestamp: true,
    }),
    new winston.transports.File({
      name: 'error-file',
      filename: path.resolve(`${config.logsDirectory}/icons-error.log`),
      level: 'error',
      timestamp: true,
    }),
  ],
  exitOnError: false,
});

module.exports = {
  logFile,
  logger,
};
