import express from 'express';

import { asyncHandler } from '../middleware/handlers.js';
import { validateShortCode } from '../middleware/validation.js';

import { recordClick, resolveShortCode } from '../services/shortener.js';

import { AppError } from '../util/error.js';

const router = express.Router();

/**
 * GET /redirect/:short
 * Redirect to original URL and track clicks
 */
router.get(
    '/:shortcode',
    validateShortCode,
    asyncHandler(async (req, res) => {
        const { shortcode } = req.params;

        // resolve short code to URL
        const url = await resolveShortCode(shortcode);

        if (!url) {
            throw new AppError('Short URL not found', 404);
        }

        // fire and forget
        recordClick(url.id);

        // perform redirect
        res.redirect(301, url.original);
    })
);

export default router;
