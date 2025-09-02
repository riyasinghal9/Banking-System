const request = require('supertest');
const app = require('../src/server');

describe('Health Check', () => {
  test('GET /health - should return health status', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });
});
