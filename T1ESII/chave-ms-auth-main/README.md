# chave-ms-auth

Microsserviço de autenticação do projeto **Chave — Autoavaliação de Competências para Pessoas Idosas** (PUCRS/UFRGS).

API REST com JWT (access + refresh), RBAC por `role` e documentação Swagger em `/docs`.

---

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/health` | — | Health check |
| POST | `/auth/register` | — | Registrar usuário (`name`, `email`, `password`) |
| POST | `/auth/login` | — | Login → `{ access_token, refresh_token }` |
| POST | `/auth/refresh` | — | Renovar access token via `refresh_token` |
| POST | `/auth/logout` | — | Revogar refresh token no banco |
| GET | `/auth/me` | Bearer | Dados do usuário autenticado |
| GET | `/auth/admin/users` | Bearer + `role=admin` | Listar todos os usuários |

Swagger completo em **`http://localhost:3001/docs`**.

---

## RBAC

O campo `role` do usuário pode ser `user` (padrão) ou `admin`.  
Endpoints protegidos verificam o papel via middleware `requireRole('admin')`.  
Para promover um usuário a admin, altere diretamente no banco:

```sql
UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
```

---

## Variáveis de ambiente

Copie e ajuste:

```bash
cp .env.example .env
```

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3001` | Porta do servidor |
| `JWT_SECRET` | `dev-secret` | Segredo para assinar access tokens |
| `JWT_REFRESH_SECRET` | `dev-refresh-secret` | Segredo para assinar refresh tokens |
| `DB_HOST` | — | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_USER` | — | Usuário do banco |
| `DB_PASSWORD` | — | Senha do banco |
| `DB_NAME` | — | Nome do banco |

---

## Como rodar

### Desenvolvimento local

```bash
npm install
npm run dev   # nodemon — hot reload
```

> Requer PostgreSQL disponível. Veja as variáveis acima.

### Via docker-compose (recomendado)

```bash
cd ../chave-infra-main
make setup    # sobe todos os serviços
```

### Testes

```bash
npm test                # roda os testes
npm run test:coverage   # com relatório de cobertura
```

### Lint

```bash
npm run lint
```

---

## Secrets necessários no GitHub Actions

| Secret | Descrição |
|--------|-----------|
| `DOCKERHUB_USERNAME` | Usuário do Docker Hub |
| `DOCKERHUB_TOKEN` | Token de acesso do Docker Hub |
