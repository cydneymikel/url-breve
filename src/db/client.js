import PrismaAdapter from './adapters/postgres.js';
import MongoDBAdapter from './adapters/mongodb.js';

import config from '../util/env.js';
import logger from '../util/logger.js';

const adapters = {
    postgres: PrismaAdapter,
    mongo: MongoDBAdapter
};

/**
 * Create and return the database client based on config
 * @returns {PrismaAdapter|MongoDBAdapter} Database client instance
 * @throws {Error} If the DB_ADAPTER value is unsupported
 */
export function createDatabaseClient() {
    const adapterType = config.dbAdapter.toLowerCase();
    const Adapter = adapters[adapterType];

    if (!Adapter) {
        throw new Error(`Invalid DB_ADAPTER: "${adapterType}". Supported: ${Object.keys(adapters).join(', ')}`);
    }

    logger.info(`Initializing database client: ${adapterType}`);
    return new Adapter();
}

const client = createDatabaseClient();
export default client;
