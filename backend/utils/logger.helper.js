"use strict";

const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname,module',
            messageFormat: '{module} - {msg}',
            singleLine: true,
          },
        },
      }
    : {}),
});

const loggerHelper = {};

loggerHelper.createChildLogger = (module) => {
  return logger.child({ module });
};

loggerHelper.logger = logger;
loggerHelper.serverLogger = logger.child({ module: 'server' });
loggerHelper.authLogger = logger.child({ module: 'auth' });
loggerHelper.errorLogger = logger.child({ module: 'error' });
loggerHelper.requestLogger = logger.child({ module: 'request' });
loggerHelper.dbLogger = logger.child({ module: 'database' });

loggerHelper.info = (...args) => logger.info(...args);
loggerHelper.warn = (...args) => logger.warn(...args);
loggerHelper.error = (...args) => logger.error(...args);

loggerHelper.logRequest = (req, res, next) => {
  const start = Date.now();

  loggerHelper.requestLogger.info({
    method: req.method,
    url: req.url,
    ip: req.client_ip_address || req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id || Math.random().toString(36).substr(2, 9)
  }, 'Incoming request');

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    loggerHelper.requestLogger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.client_ip_address || req.ip
    }, 'Request completed');
  });

  next();
};

loggerHelper.logError = (error, req = null, additionalInfo = {}) => {
  const errorInfo = {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...additionalInfo
    }
  };

  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.url,
      ip: req.client_ip_address || req.ip,
      userAgent: req.get('User-Agent')
    };
  }

  loggerHelper.errorLogger.error(errorInfo, 'Application error occurred');
};

loggerHelper.logAuth = (action, userId, success, additionalInfo = {}) => {
  loggerHelper.authLogger.info({
    action,
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  }, `Authentication ${action}`);
};

loggerHelper.logDatabase = (operation, collection, success, duration, additionalInfo = {}) => {
  loggerHelper.dbLogger.debug({
    operation,
    collection,
    success,
    duration: `${duration}ms`,
    ...additionalInfo
  }, `Database ${operation}`);
};

module.exports = loggerHelper;
