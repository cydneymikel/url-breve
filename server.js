/**
 * Server Entry Point
 * Initializes the application and starts the server
 */

import createApp from './src/app.js';
import config from './src/util/env.js';
import logger from './src/util/logger.js';
import client from './src/db/client.js';

/**
 * Initialize and start the server
 */
const startServer = async () => {
    try {
        logger.info('Starting URL Reductio server...');
        logger.info({ env: config.nodeEnv }, 'Environment');

        logger.info('Connecting to database...');
        await client.connect();

        const app = createApp();

        const server = app.listen(config.port, () => {
            logger.info(
                {
                    port: config.port,
                    baseUrl: config.baseUrl,
                    api: `http://localhost:${config.port}`,
                    health: `http://localhost:${config.port}/health`
                },
                'Server started'
            );
        });

        const shutdown = async (signal) => {
            logger.info({ signal }, 'Shutdown signal received');

            server.close(async () => {
                await client.disconnect();
                logger.info('Shutdown complete');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
};

startServer();
