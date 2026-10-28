export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, req, res, _next) {
  if (res.headersSent) return;
  const status = error.status
    || (error.name === 'ValidationError' ? 400 : error.code === 11000 ? 409 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({
    error: status >= 500 ? 'An unexpected server error occurred.' : status === 409 && error.code === 11000
      ? 'A record with these details already exists.'
      : error.message,
  });
}

export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
