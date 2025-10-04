import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';

// Mock database with proper ES module support
const mockDatabase = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    createUrl: jest.fn(),
    findUrlForRedirect: jest.fn(),
    shortCodeExists: jest.fn(),
    aliasExists: jest.fn(),
    recordClick: jest.fn(),
    shortenCount: jest.fn(),
    clickCount: jest.fn()
};

jest.unstable_mockModule('../db/client.js', () => ({ default: mockDatabase }));

// Import after mocking
const { default: createApp } = await import('../app.js');
const app = createApp();

describe('POST /shorten', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default: no collisions
        mockDatabase.shortCodeExists.mockResolvedValue(false);
        mockDatabase.aliasExists.mockResolvedValue(false);
    });

    test('should create short URL with valid input', async () => {
        mockDatabase.createUrl.mockResolvedValue({
            id: 'test-id',
            short: 'abc123',
            original: 'https://example.com',
            alias: null,
            created: new Date(),
            expires: null,
            active: true
        });

        const response = await request(app)
            .post('/shorten')
            .send({ original: 'https://example.com' });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('short');
        expect(response.body.data).toHaveProperty('shortUrl');
    });

    test('should create short URL with custom alias', async () => {
        // Ensure alias doesn't exist and short code doesn't collide
        mockDatabase.aliasExists.mockResolvedValue(false);
        mockDatabase.shortCodeExists.mockResolvedValue(false);

        mockDatabase.createUrl.mockResolvedValue({
            id: 'test-id',
            short: 'mylink',
            original: 'https://example.com',
            alias: 'mylink',
            created: new Date(),
            expires: null,
            active: true
        });

        const response = await request(app)
            .post('/shorten')
            .send({
                original: 'https://example.com',
                alias: 'mylink'
            });

        if (response.status !== 201) {
            console.log('Response body:', response.body);
        }

        expect(response.status).toBe(201);
        expect(response.body.data.alias).toBe('mylink');
    });

    test('should return 400 for invalid URL', async () => {
        const response = await request(app)
            .post('/shorten')
            .send({ original: 'not-a-url' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(mockDatabase.createUrl).not.toHaveBeenCalled();
    });

    test('should return 409 for duplicate alias', async () => {
        // Mock alias exists
        mockDatabase.aliasExists.mockResolvedValue(true);

        const response = await request(app)
            .post('/shorten')
            .send({
                original: 'https://example.com',
                alias: 'taken'
            });

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
    });
});
