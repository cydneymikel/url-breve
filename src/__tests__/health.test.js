import { describe, test, expect } from 'vitest';
import request from 'supertest';
import createApp from '../app.js';

const app = createApp();

describe('Health Endpoints (No DB)', () => {
    describe('GET /health', () => {
        test('should return 200 with health status', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
            expect(typeof response.body.uptime).toBe('number');
        });
    });

    describe('GET /', () => {
        test('should return service information', async () => {
            const response = await request(app).get('/');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('name', 'URL Reductio');
            expect(response.body).toHaveProperty('description');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('endpoints');
        });
    });
});
