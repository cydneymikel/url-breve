import { describe, test, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// mock db with ES module support
const mockDatabase = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    createUrl: vi.fn(),
    findUrlForRedirect: vi.fn(),
    shortCodeExists: vi.fn(),
    aliasExists: vi.fn(),
    recordClick: vi.fn(),
    shortenCount: vi.fn(),
    clickCount: vi.fn()
};

vi.mock('../db/client.js', () => ({ default: mockDatabase }));

const { default: createApp } = await import('../app.js');
const app = createApp();

describe('GET /:shortcode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

        const response = await request(app).get('/abc123').redirects(0);

        expect(response.status).toBe(301);
        expect(response.headers.location).toBe('https://example.com');
        expect(mockDatabase.recordClick).toHaveBeenCalledWith('test-id');
    });

    test('should return 404 for non-existent short code', async () => {
        mockDatabase.findUrlForRedirect.mockResolvedValue(null);

        const response = await request(app).get('/notfound').redirects(0);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});
