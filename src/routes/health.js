import express from 'express';

import packageJson from '../../package.json' assert { type: 'json' };
import config from '../util/env.js';

import { asyncHandler } from '../middleware/handlers.js';
import { getStats } from '../services/shortener.js';

const router = express.Router();

/**
 * GET /health
 * Basic health check
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * GET /health/status
 * Service information + aggregate statistics
 */
router.get(
    '/status',
    asyncHandler(async (req, res) => {
        const statistics = await getStats();

        res.json({
            success: true,
            status: 'operational',
            timestamp: new Date().toISOString(),
            environment: config.nodeEnv,
            version: packageJson.version,
            uptime: process.uptime(),
            statistics
        });
    })
);

export default router;
