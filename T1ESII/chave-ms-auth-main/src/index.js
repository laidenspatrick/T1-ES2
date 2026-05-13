require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const PORT = process.env.PORT || 3001;

// Criar tabela de usuÃ¡rios se nÃ£o existir e injetar usuÃ¡rio de teste
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
  )
`).then(async () => {
  // === INJEÇÃO DO USUÁRIO DE TESTE (Requisito 1) ===
  const emailTeste = "teste@teste.com";
  const senhaTeste = "123456";
  const { rowCount } = await pool.query("SELECT * FROM users WHERE email = $1", [emailTeste]);
  
  if (rowCount === 0) {
    const hash = await bcrypt.hash(senhaTeste, 10);
    await pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [emailTeste, hash]);
    console.log(`[SEED] Usuário de teste '${emailTeste}' criado com sucesso!`);
  }
}).catch(console.error);

// === MIDDLEWARE DE CONTROLE DE ACESSO (RBAC / JWT) ===
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Pega o token após o "Bearer"

  if (!token) return res.status(401).json({ error: "Acesso negado: Token não fornecido" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Acesso negado: Token inválido ou expirado" });
    
    req.user = user; // Injeta os dados do usuário na requisição
    next(); // Passa para a próxima rota
  });
}

// POST /auth/register
app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email e password são obrigatórios" });

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, password_hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") { // unique_violation do postgres
      res.status(400).json({ error: "E-mail já cadastrado" });
    } else {
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  }
});

// POST /auth/login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email e password são obrigatórios" });

  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: "Credenciais inválidas" });

  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "15m",
  });
  const refresh = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, refresh });
});

// POST /auth/refresh
app.post("/auth/refresh", (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.status(400).json({ error: "refresh token obrigatório" });

  try {
    const payload = jwt.verify(refresh, JWT_SECRET);
    const token = jwt.sign({ sub: payload.sub }, JWT_SECRET, { expiresIn: "15m" });
    res.json({ token });
  } catch {
    res.status(401).json({ error: "Refresh token inválido ou expirado" });
  }
});

// POST /auth/logout
app.post("/auth/logout", (_req, res) => {
  // Stateless: em produção invalidar o refresh token no banco
  res.status(204).send();
});

// GET /auth/me (Rota Protegida usando o Middleware)
app.get("/auth/me", authenticateToken, (req, res) => {
  // Se passou pelo middleware, req.user estará disponível
  res.json({ 
    message: "Acesso autorizado!", 
    user: { id: req.user.sub, email: req.user.email } 
  });
});

app.listen(PORT, () => console.log(`chave-ms-auth rodando na porta ${PORT}`));
