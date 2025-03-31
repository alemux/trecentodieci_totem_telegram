const request = require('supertest');
const app = require('../../app');
const { validateAuth } = require('../../middleware/authMiddleware');

describe('Totem Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset validateAuth mock to default implementation
        validateAuth.mockImplementation((req, res, next) => {
            if (req.body && req.body.token && req.body.url) {
                res.status(200).json({ valid: true });
            } else if (req.headers.authorization) {
                next();
            } else {
                res.status(400).json({ error: 'Authorization header is required' });
            }
        });
    });

    describe('POST /api/validateAuth', () => {
        it('should validate auth successfully', async () => {
            const response = await request(app)
                .post('/api/validateAuth')
                .send({
                    token: 'test-token',
                    url: 'http://test-url'
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ valid: true });
        });

        it('should handle missing token and url', async () => {
            const response = await request(app)
                .post('/api/validateAuth')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/totems', () => {
        it('should return empty totems array', async () => {
            const response = await request(app)
                .get('/api/totems')
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ totems: [] });
        });

        it('should handle errors gracefully', async () => {
            // Mock validateAuth per simulare un errore
            validateAuth.mockImplementationOnce((req, res, next) => {
                const error = new Error('Test error');
                error.status = 500;
                res.status(500).json({ error: error.message });
            });

            const response = await request(app)
                .get('/api/totems')
                .set('Authorization', 'Bearer test-token');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Test error');
        });
    });
}); 