import { z } from 'zod';

import config from '../util/env.js';

const SHORTCODE_REGEX = /^[a-zA-Z0-9_-]+$/;
const RESERVED_KEYWORDS = ['api', 'admin', 'analytics', 'stats', 'dashboard', 'health', 'status'];

const shortenSchema = z.object({
    original: z
        .string({ message: 'URL is required and must be a string' })
        .max(config.maxUrlLength, `URL exceeds maximum length of ${config.maxUrlLength} characters`)
        .refine(
            (url) => {
                try {
                    const parsedUrl = new URL(url);
                    return config.allowedProtocols.includes(parsedUrl.protocol.replace(':', ''));
                } catch {
                    return false;
                }
            },
            { message: 'Invalid URL format' }
        ),
    alias: z
        .string()
        .min(3, 'Custom alias must be at least 3 characters')
        .max(30, 'Custom alias must be max 30 characters')
        .regex(SHORTCODE_REGEX, 'Alias can only contain letters, numbers, hyphens, and underscores')
        .refine((alias) => !RESERVED_KEYWORDS.includes(alias.toLowerCase()), {
            message: 'This alias is reserved and cannot be used'
        })
        .trim()
        .optional(),
    expires: z
        .string()
        .refine((date) => !isNaN(new Date(date).getTime()), { message: 'Invalid expiration date format' })
        .refine((date) => new Date(date) > new Date(), { message: 'Expiration date must be in the future' })
        .optional()
});

const shortCodeSchema = z.object({
    shortCode: z
        .string()
        .max(50, 'Short code must be max 50 characters')
        .regex(SHORTCODE_REGEX, 'Invalid short code format')
});

/**
 * Helper to wrap Zod validation in Express middleware
 * @param {z.ZodTypeAny} schema - Zod schema to validate
 * @param {'body' | 'params'} source - Where to validate
 * @returns {import('express').RequestHandler}
 */
const zodMiddleware =
    (schema, source = 'body') =>
    (req, res, next) => {
        try {
            const validated = schema.parse(req[source]);
            req[source] = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: error.errors?.[0]?.message || 'Validation error'
                });
            }
            next(error);
        }
    };

/** Middleware to validate URL shortening request */
const validateShortURL = zodMiddleware(shortenSchema, 'body');

/** Middleware to validate short code parameter */
const validateShortCode = zodMiddleware(shortCodeSchema, 'params');

export { validateShortURL, validateShortCode };
