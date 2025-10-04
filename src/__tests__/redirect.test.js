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

describe('GET /:shortcode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should redirect to original URL', async () => {
        mockDatabase.findUrlForRedirect.mockResolvedValue({
            id: 'test-id',
            short: 'abc123',
            original: 'https://example.com',
            active: true,
            expires: null
        });

        mockDatabase.recordClick.mockResolvedValue(undefined);

        const response = await request(app)
            .get('/abc123')
            .redirects(0);

        expect(response.status).toBe(301);
        expect(response.headers.location).toBe('https://example.com');
        expect(mockDatabase.recordClick).toHaveBeenCalledWith('test-id');
    });

    test('should return 404 for non-existent short code', async () => {
        mockDatabase.findUrlForRedirect.mockResolvedValue(null);

        const response = await request(app)
            .get('/notfound')
            .redirects(0);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});
