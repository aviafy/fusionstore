const logger = require('../utils/logger.helper');

const errorHandler = (err, req, res, _next) => {
  logger.logError(err, req);

  const isDevelopment = process.env.NODE_ENV === 'development';
  const status = err.status || err.statusCode || 500;

  const publicMessage =
    err.publicMessage ||
    (status >= 500 ? 'Something went wrong. Please try again later.' : err.message);

  const body = {
    message: publicMessage,
    ...(err.code && { code: err.code }),
  };

  if (isDevelopment && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
};

const notFound = (req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  error.publicMessage = `Not Found - ${req.originalUrl}`;
  error.code = 'NOT_FOUND';
  next(error);
};

module.exports = { errorHandler, notFound };
