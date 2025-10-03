import { customAlphabet } from 'nanoid';

import config from '../util/env.js';
import logger from '../util/logger.js';
import client from '../db/client.js';

import { AppError } from '../util/error.js';

/**
 * custom nanoid with URL-safe characters (excluding ambiguous characters)
 * excludes: 0, O, I, l to avoid confusion
 */
const nanoid = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', config.shortCodeLength);

/**
 * Generate a unique short code
 * @param {number} retries - Number of retries for collision handling
 * @returns {Promise<string>} Unique short code
 * @throws {AppError} If unable to generate unique code after max retries
 */
const generateShortCode = async (retries = 0) => {
    if (retries >= config.maxRetries) {
        throw new AppError('Unable to generate unique short code after maximum retries. Please try again.', 503);
    }

    const short = nanoid();
    const exists = await client.shortCodeExists(short);

    if (exists) {
        logger.warn(`Short code collision detected: ${short}. Retrying... (attempt ${retries + 1})`);
        return generateShortCode(retries + 1);
    }

    return short;
};

/**
 * Generate full short URL
 * @param {string} short - The short code
 * @returns {string} Full short URL
 */
const generateShortUrl = (short) => {
    const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
    return `${baseUrl}/${short}`;
};

/**
 * Shorten a URL
 * @param {Object} data - URL data
 * @param {string} data.original - The original URL to shorten
 * @param {string} [data.alias] - Optional custom alias
 * @param {Date} [data.expires] - Optional expiration date
 * @returns {Promise<Object>} Created URL object with short URL
 * @throws {AppError} If validation fails or alias is taken
 */
const shortenUrl = async (data) => {
    const { original, alias, expires } = data;

    // handle custom alias
    let short;
    if (alias) {
        // validation already handled by Zod middleware
        // just check if alias already exists
        const aliasExists = await client.aliasExists(alias);
        if (aliasExists) {
            throw new AppError('This custom alias is already taken', 409);
        }

        short = alias;
    } else {
        // generate unique short code
        short = await generateShortCode();
    }

    // validate expiration date
    if (expires && new Date(expires) <= new Date()) {
        throw new AppError('Expiration date must be in the future', 400);
    }

    // create URL entry
    const url = await client.createUrl({
        short,
        original,
        alias: alias || null,
        expires: expires ? new Date(expires) : null
    });

    // generate short URL
    const shortUrl = generateShortUrl(short);

    return {
        ...url,
        shortUrl
    };
};

/**
 * Resolve a short code to original URL
 * @param {string} short - The short code to resolve
 * @returns {Promise<Object|null>} URL object or null if not found
 * @throws {AppError} If URL is inactive or expired
 */
const resolveShortCode = async (short) => {
    const url = await client.findUrlForRedirect(short);

    if (!url) {
        return null;
    }

    // Check if URL is active
    if (!url.active) {
        throw new AppError('This short URL has been deactivated', 410);
    }

    // Check if URL has expired
    if (url.expires && new Date(url.expires) <= new Date()) {
        throw new AppError('This short URL has expired', 410);
    }

    return url;
};

/**
 * Record a click event for a short URL
 * Non-critical: errors are caught and logged
 * @param {number} urlId - The ID of the URL being clicked
 * @returns {Promise<void>} Resolves when the click is recorded or the error is logged
 */
const recordClick = async (urlId) => {
    try {
        await client.recordClick(urlId);
    } catch (err) {
        logger.error({ err }, 'Failed to record click');
    }
};

/**
 * Get aggregate statistics for URLs and clicks
 * @returns {Promise<{totalUrls: number, totalClicks: number}>} Statistics counts
 */
const getStats = async () => {
    const [totalUrls, totalClicks] = await Promise.all([client.shortenCount(), client.clickCount()]);
    return { totalUrls, totalClicks };
};

export { generateShortCode, generateShortUrl, getStats, recordClick, resolveShortCode, shortenUrl };
