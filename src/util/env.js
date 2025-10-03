import 'dotenv/config';

/**
 * Validate that a required environment variable exists
 * @param {string} name - Environment variable name
 * @returns {string} Environment variable value
 * @throws {Error} If variable is not set
 */
const required = (name) => {
    const value = process.env[name];
    if (!value) throw new Error(`Missing environment variable: ${name}`);
    return value;
};

/**
 * Get optional environment variable with default value
 * @param {string} name - The environment variable key.
 * @param {string|number} defaultValue - The fallback value.
 * @returns {string|number} The resolved value.
 */
const optional = (name, defaultValue) => {
    const value = process.env[name];
    if (value === undefined) return defaultValue;
    return typeof defaultValue === 'number' ? Number(value) : value;
};

/**
 * Application configuration object.
 */
const config = {
    port: optional('PORT', 3000),
    nodeEnv: optional('NODE_ENV', 'development'),
    baseUrl: required('BASE_URL'),
    databaseUrl: required('DATABASE_URL'),
    shortCodeLength: optional('SHORT_CODE_LENGTH', 7),
    maxRetries: optional('MAX_COLLISION_RETRIES', 5),
    rateLimit: {
        windowMs: optional('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
        maxRequests: optional('RATE_LIMIT_MAX_REQUESTS', 100)
    },
    maxUrlLength: optional('MAX_URL_LENGTH', 2048),
    allowedProtocols: optional('ALLOWED_PROTOCOLS', 'http,https')
        .split(',')
        .map((p) => p.trim()),
    logLevel: optional('LOG_LEVEL', 'info')
};

export default config;
