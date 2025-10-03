/**
 * Custom error class for application errors
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export { AppError };
