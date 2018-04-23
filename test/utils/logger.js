/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/


const winston = require('winston');

const loggers = {};

function createLogger(level, name) {
  // a singleton and default logger
  const {
    config,
  } = winston;
  const logger = new winston.Logger({
    level,
    transports: [
      new winston.transports.Console({
        handleExceptions: true,
        formatter: options => `${
          config.colorize(options.level, options.level.toUpperCase())} ${
          name ? config.colorize(options.level, `[${name}]`) : ''
        } ${options.message ? options.message : ''} ${
          options.meta && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : ''}`,
      }),
    ],
    exitOnError: false,
  });
  return logger;
}

function getLogger(name = '') {
  // set the logging level based on the environment variable
  // configured by the peer
  const level = process.env.STARTER_LOGGING_LEVEL;
  let loglevel;
  if (typeof level === 'string') {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        loglevel = 'fatal';
        break;
      case 'ERROR':
        loglevel = 'error';
        break;
      case 'WARNING':
        loglevel = 'warn';
        break;
      case 'DEBUG':
        loglevel = 'debug';
        break;
      default:
        loglevel = 'info';
    }
  }

  let logger;
  if (loggers[name]) {
    logger = loggers[name];
    logger.level = loglevel;
  } else {
    logger = createLogger(loglevel, name);
    loggers[name] = logger;
  }

  return logger;
}

module.exports = { getLogger };
