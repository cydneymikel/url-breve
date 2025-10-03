import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';

import config from './util/env.js';
import logger from './util/logger.js';

import { errorHandler, notFoundHandler } from './middleware/handlers.js';

import shorten from './routes/shorten.js';
import redirect from './routes/redirect.js';
import health from './routes/health.js';

const createApp = () => {
    const app = express();

    app.use(
        helmet({
            contentSecurityPolicy: false, // Disable CSP for API
            crossOriginEmbedderPolicy: false
        })
    );

    app.use(cors());

    app.use(pinoHttp({ logger }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    const limiter = rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.maxRequests,
        message: {
            success: false,
            error: 'Too many requests from this IP, please try again later'
        },
        standardHeaders: true,
        legacyHeaders: false
    });

    app.use('/shorten', limiter);

    // root endpoint
    app.get('/', (req, res) => {
        res.json({
            success: true,
            name: 'URL Reductio',
            description: 'A simple and secure URL shortening service',
            version: '1.0.0',
            endpoints: {
                shorten: 'POST /shorten - Create a short URL',
                redirect: 'GET /:shortCode - Redirect to original URL',
                health: 'GET /health - Health check',
                status: 'GET /status - Service statistics'
            }
        });
    });

    app.use('/health', health);
    app.use('/shorten', shorten);
    app.use('/', redirect);

    // 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(errorHandler);

    return app;
};

export default createApp;
