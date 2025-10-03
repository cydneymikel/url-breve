import { PrismaClient } from '@prisma/client';

import config from '../util/env.js';
import logger from '../util/logger.js';

/**
 * Prisma client singleton
 */
class Database {
    constructor() {
        this.prisma = new PrismaClient({
            log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error']
        });
    }

    /**
     * Initialize database connection
     */
    async connect() {
        try {
            await this.prisma.$connect();
            logger.info('Database connected successfully');
        } catch (error) {
            logger.error({ err: error }, 'Database connection failed');
            throw error;
        }
    }

    /**
     * Disconnect from database
     */
    async disconnect() {
        await this.prisma.$disconnect();
        logger.info('Database disconnected');
    }

    /**
     * Create a new URL entry
     * @param {Object} data - URL data
     * @returns {Promise<Object>} Created URL object
     */
    async createUrl(data) {
        return this.prisma.shorten.create({
            data: {
                short: data.short,
                original: data.original,
                alias: data.alias || null,
                expires: data.expires || null
            }
        });
    }

    /**
     * Find URL for redirect (lightweight query)
     * @param {string} short - The short code to search for
     * @returns {Promise<Object|null>} URL object or null
     */
    async findUrlForRedirect(short) {
        return this.prisma.shorten.findUnique({
            where: { short }
        });
    }

    /**
     * Check if short code exists
     * @param {string} short - The short code to check
     * @returns {Promise<boolean>} True if exists
     */
    async shortCodeExists(short) {
        const count = await this.prisma.shorten.count({
            where: { short }
        });
        return count > 0;
    }

    /**
     * Check if custom alias exists
     * @param {string} alias - The alias to check
     * @returns {Promise<boolean>} True if exists
     */
    async aliasExists(alias) {
        const count = await this.prisma.shorten.count({
            where: { alias: alias }
        });
        return count > 0;
    }

    /**
     * Record a click event
     * @param {Object} data - Click data
     * @returns {Promise<Object>} Created click object
     */
    async recordClick(urlId) {
        return this.prisma.click.create({ data: { urlId } });
    }

    /**
     * Count total shortened URLs
     * @returns {Promise<number>} Number of URLs
     */
    async shortenCount() {
        return this.prisma.shorten.count();
    }

    /**
     * Count total click events
     * @returns {Promise<number>} Number of clicks
     */
    async clickCount() {
        return this.prisma.click.count();
    }
}

// Export singleton instance
const database = new Database();

export default database;
