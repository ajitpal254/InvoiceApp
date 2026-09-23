import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../middleware/auth.js';

describe('API Security & Endpoints', () => {
  it('should include Helmet security response headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should return health status on /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBeOneOf([200, 503]);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('service', 'nova-invoice API');
    expect(res.body).toHaveProperty('database');
  });

  it('should reject unauthenticated requests to protected invoice routes', async () => {
    const res = await request(app).get('/api/invoices');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Authorization token required');
  });

  it('should reject invalid auth registration payloads with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'ab', // too short (< 3)
        email: 'invalid-email',
        password: '123' // too short (< 6)
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
    expect(res.body).toHaveProperty('errors');
  });

  it('should reject requests with invalid / tampered JWTs', async () => {
    const res = await request(app)
      .get('/api/invoices')
      .set('Authorization', 'Bearer invalid.token.value');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid or expired authorization token');
  });

  it('should reject invoice creation with invalid document data', async () => {
    const validToken = jwt.sign(
      { id: '60d0fe4f5311236168a109ca', username: 'testuser', email: 'test@example.com' },
      getJwtSecret(),
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        docType: 'invalid_type', // not in enum
        items: [{ qty: -5 }] // invalid negative quantity
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
  });

  it('should sanitize MongoDB operator injections in request payload', async () => {
    const validToken = jwt.sign(
      { id: '60d0fe4f5311236168a109ca', username: 'testuser', email: 'test@example.com' },
      getJwtSecret(),
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        docType: 'gst_invoice',
        $where: 'sleep(5000)',
        companyName: 'Test Security Co',
        items: [{ qty: 1, price: 100, taxRate: 18 }]
      });

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('$where');
    expect(res.body.subtotal).toBe(100);
    expect(res.body.taxAmount).toBe(18);
    expect(res.body.grandTotal).toBe(118);
  });

  it('should recalculate financial totals on server side and ignore client tampering', async () => {
    const validToken = jwt.sign(
      { id: '60d0fe4f5311236168a109ca', username: 'testuser', email: 'test@example.com' },
      getJwtSecret(),
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        docType: 'gst_invoice',
        companyName: 'Tamper Test Co',
        subtotal: 0.01, // client attempted fake subtotal
        taxAmount: 0.00, // client attempted fake tax
        grandTotal: 1.00, // client attempted fake grand total
        items: [
          { qty: 2, price: 250, discRate: 0, taxRate: 18 }
        ]
      });

    expect(res.status).toBe(201);
    // Server must have computed 2 * 250 = 500 subtotal, 18% = 90 tax, 590 grand total
    expect(res.body.subtotal).toBe(500);
    expect(res.body.taxAmount).toBe(90);
    expect(res.body.grandTotal).toBe(590);
  });

  it('should enforce IDOR protection when querying by invoice ID', async () => {
    const userAToken = jwt.sign(
      { id: '60d0fe4f5311236168a109ca', username: 'userA', email: 'usera@example.com' },
      getJwtSecret(),
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    // Create an invoice as User A
    const created = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        docType: 'gst_invoice',
        companyName: 'User A Private Billing',
        items: [{ qty: 1, price: 100 }]
      });

    const invoiceId = created.body._id;
    expect(invoiceId).toBeDefined();

    // User B attempts to access User A's invoice
    const userBToken = jwt.sign(
      { id: '60d0fe4f5311236168a109cb', username: 'userB', email: 'userb@example.com' },
      getJwtSecret(),
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const getRes = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(getRes.status).toBe(404);
    expect(getRes.body).toHaveProperty('message', 'Invoice not found or unauthorized');

    // User B attempts to delete User A's invoice
    const delRes = await request(app)
      .delete(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(delRes.status).toBe(404);
    expect(delRes.body).toHaveProperty('message', 'Invoice not found or unauthorized');

    // Clean up as User A
    const cleanup = await request(app)
      .delete(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(cleanup.status).toBe(200);
  });
});
