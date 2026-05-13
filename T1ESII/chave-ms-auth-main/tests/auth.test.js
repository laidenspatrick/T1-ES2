// Testes unitários do MS Auth — Jest + supertest com mock do pool pg
'use strict';

jest.mock('../src/db', () => ({ query: jest.fn() }));

const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = require('../src/db');
const { app } = require('../src/app');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

let TEST_HASH;

beforeAll(async () => {
  TEST_HASH = await bcrypt.hash('senha123', 10);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── /health ─────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── POST /auth/register ─────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  it('cria usuário com dados válidos', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Maria', email: 'maria@test.com', role: 'user', created_at: new Date() }],
    });

    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Maria', email: 'maria@test.com', password: 'senha123' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('maria@test.com');
    expect(res.body.role).toBe('user');
  });

  it('retorna 400 para e-mail duplicado', async () => {
    pool.query.mockRejectedValueOnce({ code: '23505' });

    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Maria', email: 'maria@test.com', password: 'senha123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cadastrado/i);
  });

  it('retorna 400 para senha curta demais', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Maria', email: 'maria@test.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/senha/i);
  });

  it('retorna 400 para nome faltando', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'maria@test.com', password: 'senha123' });

    expect(res.status).toBe(400);
  });
});

// ─── POST /auth/login ────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  it('retorna access_token e refresh_token para credenciais válidas', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 1, email: 'a@test.com', password_hash: TEST_HASH, role: 'user' }],
      })
      .mockResolvedValueOnce({ rows: [] }); // INSERT refresh_tokens

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'a@test.com', password: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
  });

  it('retorna 401 para senha incorreta', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'a@test.com', password_hash: TEST_HASH, role: 'user' }],
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'a@test.com', password: 'senhaerrada' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/credenciais/i);
  });

  it('retorna 401 para usuário inexistente', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@test.com', password: 'senha123' });

    expect(res.status).toBe(401);
  });
});

// ─── POST /auth/refresh ──────────────────────────────────────────────────────

describe('POST /auth/refresh', () => {
  it('retorna novo access_token para refresh_token válido', async () => {
    const refresh_token = jwt.sign({ sub: 1 }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })       // token existe no banco
      .mockResolvedValueOnce({ rows: [{ role: 'user' }] }); // busca role do usuário

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
  });

  it('retorna 401 para refresh_token revogado (não está no banco)', async () => {
    const refresh_token = jwt.sign({ sub: 1 }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    pool.query.mockResolvedValueOnce({ rows: [] }); // não encontrado no banco

    const res = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/revogado/i);
  });

  it('retorna 401 para refresh_token com assinatura inválida', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refresh_token: 'token.invalido.aqui' });

    expect(res.status).toBe(401);
  });

  it('retorna 400 quando refresh_token não é enviado', async () => {
    const res = await request(app).post('/auth/refresh').send({});
    expect(res.status).toBe(400);
  });
});

// ─── POST /auth/logout ───────────────────────────────────────────────────────

describe('POST /auth/logout', () => {
  it('retorna 204 e revoga o refresh_token', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const refresh_token = jwt.sign({ sub: 1 }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const res = await request(app).post('/auth/logout').send({ refresh_token });

    expect(res.status).toBe(204);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM refresh_tokens'),
      expect.any(Array),
    );
  });

  it('retorna 204 mesmo sem refresh_token no body', async () => {
    const res = await request(app).post('/auth/logout').send({});
    expect(res.status).toBe(204);
  });
});

// ─── Middleware authenticateToken ────────────────────────────────────────────

describe('authenticateToken (via GET /auth/me)', () => {
  it('retorna 401 sem Authorization header', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/token/i);
  });

  it('retorna 403 com token inválido', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(403);
  });

  it('passa para o próximo handler com token válido', async () => {
    const token = jwt.sign(
      { sub: 1, email: 'a@test.com', role: 'user' },
      JWT_SECRET,
      { expiresIn: '15m' },
    );
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Test', email: 'a@test.com', role: 'user', created_at: new Date() }],
    });

    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('a@test.com');
  });
});

// ─── Middleware requireRole (via GET /auth/admin/users) ─────────────────────

describe('requireRole (via GET /auth/admin/users)', () => {
  it('retorna 403 para usuário com role "user"', async () => {
    const token = jwt.sign(
      { sub: 1, email: 'user@test.com', role: 'user' },
      JWT_SECRET,
      { expiresIn: '15m' },
    );

    const res = await request(app)
      .get('/auth/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/permissão/i);
  });

  it('permite acesso para role "admin"', async () => {
    const token = jwt.sign(
      { sub: 1, email: 'admin@test.com', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '15m' },
    );
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin', created_at: new Date() }],
    });

    const res = await request(app)
      .get('/auth/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
