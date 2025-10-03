import config from '../util/env.js';
import logger from '../util/logger.js';

import { AppError } from '../util/error.js';

/**
 * Main error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // always log full error details
    logger.error(
        {
            err,
            statusCode,
            url: req.originalUrl,
            method: req.method
        },
        message
    );

    // sanitize 500 errors to avoid leaking implementation details
    const clientMessage =
        config.nodeEnv === 'production' && statusCode === 500 ? 'An internal server error occurred' : message;

    const response = {
        success: false,
        error: clientMessage
    };

    // include stack trace only in development
    if (config.nodeEnv === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * Handle 404 errors (route not found)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
    next(error);
};

/**
 * Async error wrapper - catches errors in async route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export { errorHandler, notFoundHandler, asyncHandler };
