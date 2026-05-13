'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';

// ─── DB INIT ──────────────────────────────────────────────────────────────────

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id           SERIAL PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      email        VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role         VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

function authenticateToken(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth && auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado: permissão insuficiente' });
    }
    next();
  };
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name:     z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

// ─── SWAGGER ──────────────────────────────────────────────────────────────────

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chave — MS Auth API',
      version: '1.0.0',
      description:
        'API de autenticação do sistema Chave — Autoavaliação de Competências para Pessoas Idosas (PUCRS/UFRGS)',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        UserPublic: {
          type: 'object',
          properties: {
            id:         { type: 'integer' },
            name:       { type: 'string' },
            email:      { type: 'string', format: 'email' },
            role:       { type: 'string', enum: ['user', 'admin'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        TokenPair: {
          type: 'object',
          properties: {
            access_token:  { type: 'string' },
            refresh_token: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
  },
  apis: [__filename],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── ROUTES ───────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Serviço saudável
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 */
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: Maria Silva }
 *               email:    { type: string, format: email, example: maria@example.com }
 *               password: { type: string, minLength: 6, example: senha123 }
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       400:
 *         description: Dados inválidos ou e-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  const { name, email, password } = parsed.data;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
      [name, email, password_hash],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'E-mail já cadastrado' });
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Autenticar usuário e obter tokens JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Tokens JWT (access 15min + refresh 7d)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenPair'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  const { email, password } = parsed.data;

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const access_token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' },
  );
  const refresh_token = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  const token_hash = crypto.createHash('sha256').update(refresh_token).digest('hex');
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, token_hash, expires_at],
  );

  res.json({ access_token, refresh_token });
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Renovar access token usando refresh token
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token: { type: string }
 *     responses:
 *       200:
 *         description: Novo access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token: { type: string }
 *       401:
 *         description: Refresh token inválido ou revogado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token obrigatório' });

  try {
    const payload = jwt.verify(refresh_token, JWT_REFRESH_SECRET);

    const token_hash = crypto.createHash('sha256').update(refresh_token).digest('hex');
    const { rows } = await pool.query(
      'SELECT id FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
      [token_hash],
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Refresh token inválido ou revogado' });

    const { rows: userRows } = await pool.query('SELECT role FROM users WHERE id = $1', [payload.sub]);
    if (!userRows[0]) return res.status(401).json({ error: 'Usuário não encontrado' });

    const access_token = jwt.sign(
      { sub: payload.sub, role: userRows[0].role },
      JWT_SECRET,
      { expiresIn: '15m' },
    );
    res.json({ access_token });
  } catch {
    res.status(401).json({ error: 'Refresh token inválido ou expirado' });
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Encerrar sessão (revoga refresh token no banco)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token: { type: string }
 *     responses:
 *       204:
 *         description: Logout realizado com sucesso
 */
app.post('/auth/logout', async (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token) {
    const token_hash = crypto.createHash('sha256').update(refresh_token).digest('hex');
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [token_hash]);
  }
  res.status(204).send();
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Dados do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       401:
 *         description: Token não fornecido
 *       403:
 *         description: Token inválido ou expirado
 */
app.get('/auth/me', authenticateToken, async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [req.user.sub],
  );
  if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(rows[0]);
});

/**
 * @openapi
 * /auth/admin/users:
 *   get:
 *     summary: Listar todos os usuários — somente admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserPublic'
 *       403:
 *         description: Acesso negado
 */
app.get('/auth/admin/users', authenticateToken, requireRole('admin'), async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC',
  );
  res.json(rows);
});

module.exports = { app, initDb, authenticateToken, requireRole };
