// Catch requests to routes that don't exist
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler for all application errors
export const errorHandler = (err, req, res, next) => {
  // If status code is 200 but there's an error, change it to 500 (Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle Mongoose bad ObjectId errors
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Resource not found';
    statusCode = 404;
  }

  res.status(statusCode).json({
    message: message,
    // Only show stack trace if in development mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};