# Como Rodar o T1 — Projeto Chave

Sistema de Autoavaliação de Competências para Pessoas Idosas (PUCRS/UFRGS).

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Docker + Docker Compose v2 | 24+ | https://docs.docker.com/get-docker/ |
| Node.js *(só para testes locais)* | 20 LTS | https://nodejs.org/ |
| Git | qualquer | https://git-scm.com/ |

---

## Estrutura do repositório

Todo o código está em um único repositório, dentro da pasta `T1ESII/`:

```
T1-ES2/
└── T1ESII/
    ├── chave-infra-main/     ← docker-compose + Makefile + Terraform  (você está aqui)
    ├── chave-ms-auth-main/   ← API REST (Node.js / Express / JWT / PostgreSQL)
    ├── chave-mfe-auth-main/  ← Microfrontend de auth (React / TypeScript / MUI)
    ├── chave-shell-main/     ← Shell host (React Router + Module Federation)
    └── docs/                 ← ADRs e UI Manual
```

> O `docker-compose.yml` usa caminhos relativos (`../chave-ms-auth-main`, etc.),
> então a estrutura de pastas acima deve ser mantida.

---

## Arquitetura resumida

```
Browser → Shell :3000
              └─(Module Federation)→ MFE Auth :4001
                                         └─(HTTP/axios)→ MS Auth API :3001
                                                                └─(pg)→ PostgreSQL :5432
```

| Serviço | Tecnologia | Porta |
|---|---|---|
| chave-shell | React + React Router + Vite | 3000 |
| chave-ms-auth | Node.js + Express + JWT | 3001 |
| chave-mfe-auth | React + TypeScript + MUI + Vite | 4001 |
| postgres | PostgreSQL 15 | 5432 |

---

## 1. Subir tudo com Docker (recomendado)

```bash
cd T1ESII/chave-infra-main

# Copiar variáveis de ambiente (só na primeira vez)
cp .env.example .env

# Construir imagens e subir todos os serviços
make setup
```

O `make setup` executa: pull das imagens base → build dos containers → sobe PostgreSQL, MS Auth, MFE Auth e Shell.

**Primeira execução:** ~2–5 minutos (download das imagens Node/Postgres).

### Verificar que tudo subiu

```bash
make health
```

Saída esperada:
```
✔ postgres       healthy
✔ chave-ms-auth  healthy  → http://localhost:3001/health
✔ chave-mfe-auth running  → http://localhost:4001
✔ chave-shell    running  → http://localhost:3000
```

---

## 2. URLs de acesso

| O quê | URL |
|---|---|
| **Interface principal (Shell)** | http://localhost:3000 |
| Tela de login | http://localhost:3000/login |
| Tela de cadastro | http://localhost:3000/register |
| Dashboard (requer login) | http://localhost:3000/home |
| **Swagger UI** | http://localhost:3001/docs |
| Health check da API | http://localhost:3001/health |
| MFE standalone | http://localhost:4001 |

---

## 3. Testar manualmente — fluxo completo

### Via browser (http://localhost:3000)

1. Acesse http://localhost:3000 → será redirecionado para `/login`
2. Clique em **"Não possui conta? Cadastre-se"**
3. Preencha nome, e-mail e senha (mín. 6 caracteres) → **Cadastrar**
4. Após o alerta verde, faça login com as credenciais cadastradas
5. Você verá a tela **"Minha Conta"** com seus dados
6. Clique em **"Sair"** — o token é removido e volta para `/login`

### Via Swagger (http://localhost:3001/docs)

1. Abra o Swagger
2. `POST /auth/register` — crie um usuário
3. `POST /auth/login` — copie o `access_token` da resposta
4. Clique em **"Authorize"** → cole `Bearer <access_token>`
5. `GET /auth/me` — veja seus dados
6. `POST /auth/refresh` — use o `refresh_token` para renovar o `access_token`
7. `POST /auth/logout` — revoga o refresh token no banco

### Via curl

```bash
# Cadastrar usuário
curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","email":"maria@exemplo.com","password":"senha123"}' | jq

# Login — guarde os tokens
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@exemplo.com","password":"senha123"}' | jq

# Meus dados (troque TOKEN pelo access_token)
curl -s http://localhost:3001/auth/me \
  -H "Authorization: Bearer TOKEN" | jq

# Renovar access token (troque REFRESH pelo refresh_token)
curl -s -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"REFRESH"}' | jq

# Logout (revoga o refresh token no banco)
curl -s -X POST http://localhost:3001/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"REFRESH"}'
```

---

## 4. Testar rota de admin (`GET /auth/admin/users`)

Por padrão todos os usuários têm `role = 'user'`. Para testar o endpoint admin:

```bash
# Conectar ao banco
docker exec -it chave-postgres psql -U chave -d chave_auth

# Promover usuário a admin
UPDATE users SET role = 'admin' WHERE email = 'maria@exemplo.com';
\q
```

Faça login novamente para obter um token com `role: admin` e então:

```bash
# Deve retornar 200 com lista de usuários
curl -s http://localhost:3001/auth/admin/users \
  -H "Authorization: Bearer TOKEN_ADMIN" | jq

# Deve retornar 403
curl -s http://localhost:3001/auth/admin/users \
  -H "Authorization: Bearer TOKEN_USER"
```

---

## 5. Rodar os testes localmente

> Requer Node.js 20+ instalado.

### MS Auth — Jest + supertest

```bash
cd T1ESII/chave-ms-auth-main
npm install
npm run test:coverage
```

Saída esperada: **14 testes passando**, cobertura ≥ 70% em `src/app.js`.

```
PASS tests/auth.test.js
  GET /health                             ✓
  POST /auth/register                     ✓ ✓ ✓ ✓
  POST /auth/login                        ✓ ✓ ✓
  POST /auth/refresh                      ✓ ✓ ✓ ✓
  POST /auth/logout                       ✓ ✓
  authenticateToken (via GET /auth/me)    ✓ ✓ ✓
  requireRole (via GET /auth/admin/users) ✓ ✓
```

### MFE Auth — Vitest + React Testing Library

```bash
cd T1ESII/chave-mfe-auth-main
npm install
npm test
```

Saída esperada: **~9 testes passando**.

```
✓ LoginPage    — renderiza campos, submit válido, exibe erro
✓ RegisterPage — renderiza campos, submit válido, exibe erro servidor
✓ api helpers  — saveTokens, clearTokens, getAccessToken
```

### Lint do MS Auth

```bash
cd T1ESII/chave-ms-auth-main
npm run lint
```

---

## 6. Outros comandos do Makefile

```bash
cd T1ESII/chave-infra-main

make up        # Sobe containers sem rebuild
make down      # Para e remove containers (dados preservados no volume)
make reset     # Para + remove volumes (apaga dados do banco) + reinicia
make logs      # Logs de todos os serviços (Ctrl+C para sair)
```

Logs de um serviço específico:

```bash
docker compose logs -f chave-ms-auth
docker compose logs -f chave-mfe-auth
docker compose logs -f chave-shell
docker compose logs -f postgres
```

---

## 7. Variáveis de ambiente

O `.env` em `chave-infra-main/` controla todos os serviços:

| Variável | Padrão | Descrição |
|---|---|---|
| `JWT_SECRET` | `supersecret123` | Assina access tokens |
| `JWT_REFRESH_SECRET` | *(usa fallback)* | Assina refresh tokens; defina explicitamente |
| `MS_AUTH_PORT` | `3001` | Porta da API |
| `MFE_AUTH_PORT` | `4001` | Porta do microfrontend |
| `SHELL_PORT` | `3000` | Porta do shell |
| `DB_HOST` | `postgres` | Nome do serviço Docker (não `localhost`) |
| `DB_USER` | `chave` | Usuário do PostgreSQL |
| `DB_PASSWORD` | `chave_secret` | Senha do PostgreSQL |
| `DB_NAME` | `chave_auth` | Nome do banco |
| `MFE_AUTH_URL` | `http://localhost:4001/assets/remoteEntry.js` | URL do remoteEntry para o Shell |

> **Atenção:** os valores padrão são seguros apenas para desenvolvimento local.

---

## 8. Problemas comuns

### Porta já em uso

```
Error: bind: address already in use
```

```bash
lsof -i :3000   # ou :3001, :4001, :5432
kill -9 <PID>
```

Ou altere as portas no `.env` (`MS_AUTH_PORT`, `MFE_AUTH_PORT`, `SHELL_PORT`).

---

### Tela em branco no Shell (`remoteEntry.js` não encontrado)

```
Loading chunk mfe_auth failed
```

O MFE Auth precisa estar no ar antes do Shell. Verifique:

```bash
curl http://localhost:4001/assets/remoteEntry.js
# Deve retornar JavaScript, não erro 404
```

Se não responder:
```bash
docker compose logs chave-mfe-auth
```

---

### MS Auth não conecta ao banco

```
Error: connect ECONNREFUSED
```

- `DB_HOST` deve ser `postgres` (nome do serviço Docker), **não** `localhost`
- Aguarde o health check do Postgres (~20s na primeira inicialização)

```bash
docker compose ps postgres   # deve mostrar "healthy"
```

---

### Reconstruir um serviço após mudança de código

```bash
cd T1ESII/chave-infra-main
docker compose build chave-ms-auth   # ou chave-mfe-auth, chave-shell
docker compose up -d chave-ms-auth
```

---

## 9. Checklist de entrega

- [ ] `make setup` executa sem erros
- [ ] http://localhost:3000/login carrega a tela de login
- [ ] http://localhost:3000/register carrega o cadastro
- [ ] Cadastro de usuário funciona (alerta verde)
- [ ] Login funciona → vai para `/home` com dados do usuário
- [ ] Logout remove tokens e redireciona para `/login`
- [ ] http://localhost:3001/health retorna `{ "status": "ok" }`
- [ ] http://localhost:3001/docs carrega o Swagger UI
- [ ] `POST /auth/register` funciona no Swagger
- [ ] `POST /auth/login` retorna `access_token` e `refresh_token`
- [ ] `GET /auth/me` retorna `id`, `name`, `email`, `role`, `created_at`
- [ ] `POST /auth/refresh` retorna novo `access_token`
- [ ] `GET /auth/admin/users` retorna 403 para usuário `user`
- [ ] `GET /auth/admin/users` retorna 200 para usuário `admin`
- [ ] `npm run test:coverage` verde no MS Auth (≥70%)
- [ ] `npm test` verde no MFE Auth
- [ ] 8 ADRs em `docs/adr/` com seção Trade-offs
- [ ] `docs/UI_MANUAL.md` preenchido
- [ ] `docs/AI_USAGE.md` com registros do grupo
- [ ] CI/CD verde no GitHub Actions (push para `main`)
- [ ] Secrets `DOCKERHUB_USERNAME` e `DOCKERHUB_TOKEN` configurados no GitHub
