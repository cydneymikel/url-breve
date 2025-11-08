import express from 'express';

import { asyncHandler } from '../middleware/handlers.js';
import { validateShortCode } from '../middleware/validation.js';

import { recordClick, resolveShortCode } from '../services/shortener.js';

import { AppError } from '../util/error.js';

const router = express.Router();

/**
 * GET /:shortCode
 * Redirect to original URL and track clicks
 */
router.get(
    '/:shortCode',
    validateShortCode,
    asyncHandler(async (req, res) => {
        const { shortCode } = req.params;

        const url = await resolveShortCode(shortCode);

        if (!url) {
            throw new AppError('Short URL not found', 404);
        }

        // fire and forget
        recordClick(url.id);

        res.redirect(301, url.original);
    })
);

export default router;
