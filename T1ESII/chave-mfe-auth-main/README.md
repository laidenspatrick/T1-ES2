# chave-mfe-auth

Microfrontend de autenticação do projeto **Chave**.

Expõe as páginas `LoginPage` e `RegisterPage` via **Module Federation** para serem consumidas pelo `chave-shell`. Construído com React + Vite + TypeScript e componentes do **MUI**.

---

## Tecnologias

- React 18
- TypeScript
- MUI (`@mui/material`) + Emotion
- Vite 5
- `@originjs/vite-plugin-federation` — Module Federation
- `@vitejs/plugin-react`

---

## Module Federation

Este microfrontend atua como **remote**:

| Propriedade | Valor |
|---|---|
| Nome | `mfe_auth` |
| Entry point | `http://localhost:4001/assets/remoteEntry.js` |
| Expõe | `./LoginPage` → `src/pages/LoginPage.tsx` |
|  | `./RegisterPage` → `src/pages/RegisterPage.tsx` |
| Shared | `react`, `react-dom` |

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_MS_AUTH_URL` | URL do `chave-ms-auth` (ex: `http://localhost:3001`) |

Crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia em modo desenvolvimento na porta 4001 |
| `npm run build` | Gera o bundle em `dist/` |
| `npm run preview` | Serve o build na porta 4001 |

---

## Desenvolvimento local (sem Docker)

```bash
npm install
npm run dev
```

Acesse: http://localhost:4001

---

## Executando com a stack completa

Este serviço é orquestrado pelo `chave-infra`. Consulte o [README do chave-infra](https://github.com/pucrs-sweii-2026-1-30/chave-infra).
