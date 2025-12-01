/**
 * Global Error Handler Middleware
 * Must be placed at the end of all routes
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error caught by handler:', err);

  // Default values
  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    message = errors.join(', ');
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Handle Invalid ObjectId Cast Error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  // Default fallback
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err.message,
    }),
  });
};

module.exports = errorHandler;
