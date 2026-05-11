# Como Rodar o T1 — Projeto Chave

Guia completo para executar localmente o sistema de autenticação do Projeto Chave.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|---|---|---|
| Docker | 24+ | https://docs.docker.com/get-docker/ |
| Docker Compose | v2+ | Incluído no Docker Desktop |
| Node.js | 20 LTS | https://nodejs.org/ |
| npm | 9+ | Incluído no Node.js |
| Git | qualquer | https://git-scm.com/ |

---

## Clonar os Repositórios

Clone os quatro repositórios **no mesmo diretório**:

```bash
mkdir chave && cd chave

git clone https://github.com/<seu-usuario>/chave-infra.git
git clone https://github.com/<seu-usuario>/chave-ms-auth.git
git clone https://github.com/<seu-usuario>/chave-mfe-auth.git
git clone https://github.com/<seu-usuario>/chave-shell.git
```

---

## Estrutura de Pastas Esperada

```
chave/
├── chave-infra/       ← Infraestrutura (docker-compose, Makefile)
├── chave-ms-auth/     ← Microsserviço de autenticação (Node.js + TypeScript)
├── chave-mfe-auth/    ← Microfrontend de autenticação (React + TypeScript + MUI)
└── chave-shell/       ← Shell host (React + Module Federation)
```

> **Importante:** O `docker-compose.yml` do `chave-infra` usa caminhos relativos (`../chave-ms-auth`, etc.), então todos os repositórios devem estar no mesmo diretório pai.

---

## Configurar o `.env`

```bash
cd chave-infra
cp .env.example .env
```

O arquivo `.env` gerado já tem valores funcionais para desenvolvimento local. Opcionalmente, altere `JWT_SECRET` para uma string segura:

```env
JWT_SECRET=minha-chave-secreta-forte-aqui
```

---

## Subir a Aplicação

```bash
cd chave-infra
make setup
```

O comando irá:
1. Verificar se o `.env` existe (cria automaticamente se não encontrar)
2. Construir as imagens Docker dos quatro serviços
3. Iniciar PostgreSQL, `chave-ms-auth`, `chave-mfe-auth` e `chave-shell`
4. Exibir as URLs de acesso

**Aguarde a conclusão do build** (pode levar 2–5 minutos na primeira vez).

---

## URLs Locais

| Serviço | URL |
|---|---|
| Shell (interface principal) | http://localhost:3000 |
| Microsserviço Auth (API REST) | http://localhost:3001 |
| Swagger / API Docs | http://localhost:3001/docs |
| MFE Auth (standalone) | http://localhost:4001 |
| Health check | http://localhost:3001/health |

---

## Como Testar Manualmente

### Via interface web (http://localhost:3000)

1. **Cadastrar usuário:**
   - Acesse http://localhost:3000
   - Clique em "Cadastre-se"
   - Preencha nome, email e senha (mínimo 6 caracteres)
   - Clique em "Criar Conta"
   - Aguarde o alerta verde de sucesso

2. **Fazer login:**
   - Use o email e senha cadastrados
   - Clique em "Entrar"
   - Você será redirecionado para a tela "Minha Conta"

3. **Verificar dados da conta:**
   - Veja seu nome, email, perfil (USER) e data de cadastro
   - Abra DevTools → Application → Local Storage para ver os tokens

4. **Fazer logout:**
   - Clique em "Sair"
   - Os tokens são removidos do localStorage

### Via Swagger (http://localhost:3001/docs)

1. Abra o Swagger UI
2. Cadastre um usuário: `POST /auth/register`
3. Faça login: `POST /auth/login` → copie o `access_token`
4. Clique em "Authorize" e cole o token
5. Acesse seus dados: `GET /auth/me`
6. Teste o refresh: `POST /auth/refresh` com o `refresh_token`

### Via curl

```bash
# Cadastrar usuário
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@exemplo.com","password":"senha123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@exemplo.com","password":"senha123"}'

# Meus dados (substituir TOKEN pelo access_token recebido)
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer TOKEN"

# Listar usuários como ADMIN (403 para USER comum)
curl http://localhost:3001/admin/users \
  -H "Authorization: Bearer TOKEN"

# Logout
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

### Testar rota admin

Para testar o acesso de ADMIN, você precisa alterar o role de um usuário diretamente no banco:

```bash
# Conectar ao banco PostgreSQL
docker exec -it chave-postgres psql -U chave -d chave_auth

# Promover usuário a ADMIN
UPDATE users SET role = 'ADMIN' WHERE email = 'joao@exemplo.com';
\q
```

Depois faça login novamente para obter um token com role ADMIN e teste:
```bash
curl http://localhost:3001/admin/users \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

---

## Como Rodar os Testes

### chave-ms-auth

```bash
cd chave-ms-auth
npm install
npm test
```

Os testes unitários cobrem:
- Login com credenciais válidas
- Login com senha incorreta
- Login com usuário inexistente
- Cadastro de novo usuário
- Cadastro com email duplicado
- Middleware `authenticate` (com token válido, sem token, com token inválido)
- Middleware `authorize` (USER bloqueado em rota ADMIN, ADMIN permitido)

### chave-mfe-auth

```bash
cd chave-mfe-auth
npm install
npm test
```

Os testes cobrem:
- Funções de localStorage (saveTokens, clearTokens, getAccessToken)
- Chamada HTTP de login (mock de fetch)
- Renderização do LoginPage
- Comportamento do LoginPage em sucesso e erro

---

## Como Rodar o Build

```bash
# chave-ms-auth
cd chave-ms-auth
npm run build
# Gera: dist/ com JavaScript compilado

# chave-mfe-auth
cd chave-mfe-auth
npm run build
# Gera: dist/ com remoteEntry.js e assets

# chave-shell
cd chave-shell
npm run build
# Gera: dist/ com bundle do shell
```

---

## Outros Comandos do Makefile

```bash
cd chave-infra

make up          # Sobe os containers (sem rebuild)
make down        # Para e remove os containers
make logs        # Exibe logs de todos os serviços
make logs-auth   # Exibe logs apenas do chave-ms-auth
make reset       # Para tudo, remove volumes e reinicia do zero
make health      # Verifica se os serviços estão respondendo
```

---

## Problemas Comuns

### Porta já em uso

```
Error: bind: address already in use
```

**Solução:** Pare o processo que usa a porta ou altere as portas no `.env`:
```bash
lsof -i :3000   # Identifica processo na porta 3000
kill -9 <PID>   # Para o processo
```

---

### Erro de conexão com o banco

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução:** O `DB_HOST` deve ser `postgres` (nome do serviço Docker), não `localhost`. Verifique o `.env`:
```env
DB_HOST=postgres
```

---

### JWT_SECRET não configurado

Se aparecer `Error: secretOrPrivateKey must have a value`:
```bash
# Verifique se o .env tem JWT_SECRET definido
cat .env | grep JWT_SECRET
```

---

### remoteEntry.js não encontrado

```
Loading chunk mfe_auth failed
```

**Causas possíveis:**
1. O `chave-mfe-auth` não está rodando
2. A URL do MFE está errada no `MFE_AUTH_URL`

**Verificação:**
```bash
curl http://localhost:4001/assets/remoteEntry.js
```

---

### Container não subiu

```bash
# Ver logs do container problemático
docker compose logs chave-ms-auth
docker compose logs chave-mfe-auth
docker compose logs postgres

# Verificar status dos containers
docker compose ps
```

---

## Checklist Final da Entrega

- [ ] `make setup` executa sem erros
- [ ] http://localhost:3000 carrega a tela de login
- [ ] Cadastro de usuário funciona
- [ ] Login funciona e vai para "Minha Conta"
- [ ] Logout remove os tokens
- [ ] http://localhost:3001/docs carrega o Swagger
- [ ] `POST /auth/register` funciona no Swagger
- [ ] `POST /auth/login` funciona no Swagger
- [ ] `GET /auth/me` funciona com token no Swagger
- [ ] `GET /admin/users` retorna 403 para usuário USER
- [ ] `GET /admin/users` funciona para usuário ADMIN
- [ ] `npm test` passa no chave-ms-auth
- [ ] `npm test` passa no chave-mfe-auth
- [ ] `npm run build` funciona no chave-ms-auth
- [ ] `npm run build` funciona no chave-mfe-auth
- [ ] `npm run build` funciona no chave-shell
- [ ] GitHub Actions criado nos repositórios relevantes
- [ ] ADR documentado em docs/ADR-T1-auth.md
- [ ] Manual de UI em chave-mfe-auth/docs/UI_MANUAL.md