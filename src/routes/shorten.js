import express from 'express';

import { asyncHandler } from '../middleware/handlers.js';
import { validateShortURL } from '../middleware/validation.js';

import { shortenUrl } from '../services/shortener.js';

const router = express.Router();

/**
 * POST /shorten
 * Create a new short URL
 */
router.post(
    '/',
    validateShortURL,
    asyncHandler(async (req, res) => {
        const { original, alias, expires } = req.body;

        const result = await shortenUrl({
            original,
            alias,
            expires
        });

        res.status(201).json({
            success: true,
            data: {
                id: result.id,
                short: result.short,
                shortUrl: result.shortUrl,
                original: result.original,
                alias: result.alias,
                expires: result.expires,
                created: result.created
            }
        });
    })
);

export default router;
