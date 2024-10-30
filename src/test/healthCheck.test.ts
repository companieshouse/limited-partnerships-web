import request from 'supertest';
import app from '../app';
import * as config from '../config';

describe('GET /healthcheck', () => {
  it('should return status OK', async () => {
    const response = await request(app).get(config.HEALTHCHECK_URL);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
  });
});
