# T1-ES2

Trabalho 1 da disciplina de Engenharia de Software 2.

Este repositório contém a stack **Chave** (infra + microsserviço + microfrontends) dentro da pasta `T1ESII/`.

## Estrutura

```
T1ESII/
	chave-infra-main/      # docker-compose + terraform (Ministack)
	chave-ms-auth-main/    # microsserviço de autenticação (Node/Express/JWT)
	chave-mfe-auth-main/   # microfrontend de autenticação (React + TS + MUI)
	chave-shell-main/      # shell host (React Router + Module Federation)
	docs/adr/              # decisões arquiteturais (ADR)
```

## Pré-requisitos

- Windows / macOS / Linux
- Docker Desktop instalado e rodando
- Node.js 18+ (recomendado LTS)

### Observação (Windows + PowerShell)

Se o PowerShell bloquear `npm` com erro de "execução de scripts desabilitada", use `npm.cmd` (ex: `npm.cmd install`, `npm.cmd run dev`).

## Rodar do zero (stack completa via Docker)

1) Subir o Docker Desktop e aguardar ficar pronto.

2) Criar o arquivo de variáveis da infra:

```powershell
cd .\T1ESII\chave-infra-main
Copy-Item .env.example .env
```

3) Subir a stack (Ministack + provisionamento + serviços):

```powershell
docker-compose up -d --build
```

4) Abrir no navegador:

- Shell: http://localhost:3000
- Login: http://localhost:3000/login
- Cadastro: http://localhost:3000/register

## Rodar "modo dev" (sem Docker) — recomendado para desenvolver UI

Você pode desenvolver o frontend sem subir toda a infra.

1) Suba o backend (porta 3001) e o banco (PostgreSQL) de alguma forma. A forma mais simples é rodar a infra via Docker.

2) Microfrontend (remote) — para o shell consumir, o `remoteEntry.js` precisa existir:

```powershell
cd .\T1ESII\chave-mfe-auth-main
Copy-Item .env.example .env
npm.cmd install
npm.cmd run build
npm.cmd run preview
```

3) Shell (host):

```powershell
cd .\T1ESII\chave-shell-main
npm.cmd install
npm.cmd run dev
```

Abra: http://localhost:3000

## Arquivos que você precisa criar após clonar

- `T1ESII/chave-infra-main/.env` (copiar de `.env.example`)
- `T1ESII/chave-mfe-auth-main/.env` (copiar de `.env.example`)

## CI/CD

O pipeline do GitHub Actions está em `T1ESII/.github/workflows/ci-cd.yml` e executa install/test/build do microsserviço e dos frontends.
