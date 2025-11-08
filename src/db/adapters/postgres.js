import { PrismaClient } from '@prisma/client';
import config from '../../util/env.js';
import logger from '../../util/logger.js';

/**
 * PostgreSQL Database Adapter with Prisma
 */
class PrismaAdapter {
    constructor() {
        this.db = new PrismaClient({
            log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error']
        });
    }

    async connect() {
        try {
            await this.db.$connect();
            logger.info('Database connected successfully (Prisma/PostgreSQL)');
        } catch (err) {
            logger.error({ err }, 'Database connection failed');
            throw err;
        }
    }

    async disconnect() {
        await this.db.$disconnect();
        logger.info('Database disconnected');
    }

    async createUrl({ short, original, alias = null, expires = null }) {
        return this.db.shorten.create({ data: { short, original, alias, expires } });
    }

    async findUrlForRedirect(short) {
        return this.db.shorten.findUnique({ where: { short } });
    }

    async shortCodeExists(short) {
        return this._exists('short', short);
    }

    async aliasExists(alias) {
        return this._exists('alias', alias);
    }

    async recordClick(urlId) {
        return this.db.click.create({ data: { urlId } });
    }

    async shortenCount() {
        return this.db.shorten.count();
    }

    async clickCount() {
        return this.db.click.count();
    }

    /** Private helper for existence checks */
    async _exists(field, value) {
        const count = await this.db.shorten.count({ where: { [field]: value } });
        return count > 0;
    }
}

export default PrismaAdapter;
