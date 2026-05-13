# Manual de UI — chave-mfe-auth

Microfrontend de autenticação do **Projeto Chave — Autoavaliação de Competências para Pessoas Idosas** (PUCRS/UFRGS).

---

## Telas

### 1. Login (`/login`) — `LoginPage`

Permite que usuários existentes se autentiquem.

**Campos:**
| Campo | Tipo | Validação |
|-------|------|-----------|
| E-mail | `email` | Obrigatório, formato válido |
| Senha | `password` | Obrigatória |

**Comportamento:**
- Erros de validação exibidos inline abaixo de cada campo (react-hook-form)
- Erro do servidor exibido em `Alert` vermelho
- Botão desabilitado durante requisição
- Login bem-sucedido: salva `access_token` + `refresh_token` no `localStorage` e chama `onLogin()`
- Links: "Cadastre-se" → `/register` | "Esqueci minha senha" → `/forgot-password`

**Props:**
| Prop | Tipo |
|------|------|
| `onLogin` | `() => void` |

---

### 2. Cadastro (`/register`) — `RegisterPage`

Criação de nova conta.

**Campos:**
| Campo | Tipo | Validação |
|-------|------|-----------|
| Nome completo | `text` | Obrigatório, mín. 2 caracteres |
| E-mail | `email` | Obrigatório, formato válido |
| Senha | `password` | Obrigatória, mín. 6 caracteres |

**Comportamento:**
- Erros inline via react-hook-form
- Sucesso: exibe Alert verde, aguarda 1,5s e chama `onRegistered()`
- Link: "Já possui conta? Entrar" → `/login`

**Props:**
| Prop | Tipo |
|------|------|
| `onRegistered` | `() => void` |

---

### 3. Minha Conta (`/home`) — `AccountPage`

Exibe dados do usuário autenticado.

**Dados exibidos:** nome, e-mail, perfil (chip: azul = `user`, vermelho = `admin`), data de cadastro (pt-BR).

**Comportamento:**
- Busca `GET /auth/me` ao montar; exibe spinner enquanto aguarda
- Logout: chama `POST /auth/logout`, remove tokens do `localStorage`, chama `onLogout()`
- Erro de carregamento: exibe Alert vermelho

**Props:**
| Prop | Tipo |
|------|------|
| `onLogout` | `() => void` |

---

### 4. Recuperar Senha (`/forgot-password`) — `ForgotPasswordPage`

> **Stub de UI** — funcionalidade de envio de e-mail não implementada no backend nesta versão.

**Comportamento:** Exibe formulário com campo de e-mail; após submit mostra mensagem de confirmação neutra ("Se o e-mail estiver cadastrado…").

---

## Fluxo de autenticação

```
Abrir aplicativo
      │
      ├─ access_token presente? ──► /home (AccountPage)
      │                                     │
      │                                Botão "Sair"
      │                                     │
      ▼                                     ▼
  /login (LoginPage) ◄──────────────── clearTokens()
      │
  Preenche email + senha
      │
  POST /auth/login ──► 200 ──► saveTokens() ──► /home
      │
      └──► 401 ──► Alert "Credenciais inválidas"
```

**Refresh automático (axios interceptor):**
```
Requisição autenticada ──► 401 ──► POST /auth/refresh
      │                                    │
      │                               access_token novo
      │                                    │
      └───────────────── repete requisição original
                         (se refresh expirado: clearTokens + logout)
```

---

## Paleta e tipografia

| Token | Valor | Uso |
|-------|-------|-----|
| `primary.main` | `#1565c0` | Botões, links, chips |
| `success.main` | `#2e7d32` | Botão cadastro |
| `error.main` | `#d32f2f` | Alertas, chip admin |
| Fonte base | `16px` | Acessibilidade público idoso |
| Border radius | `8px` | Cards e botões |

Contraste mínimo AA (WCAG 2.1): todos os pares text/background atingem ≥ 4,5:1.

---

## Acessibilidade

- **Fonte base 16px**: MUI `typography.fontSize: 16` — textos legíveis sem zoom
- **Labels explícitos**: todos os campos `TextField` têm `label` (MUI gera `<label>` associado)
- **Estados de erro inline**: `helperText` do TextField lido por screen readers via `aria-describedby`
- **Contraste AA**: `#1565c0` em branco → 7,4:1 (AAA)
- **Botões grandes**: `py: 1.5` → altura ≥ 48px (alvo de toque WCAG 2.5.5)
- **Foco visível**: MUI aplica `outline` no foco via teclado

---

## Module Federation

O MFE expõe 4 componentes no `remoteEntry.js`:

| Import no Shell | Arquivo | Descrição |
|-----------------|---------|-----------|
| `mfe_auth/LoginPage` | `src/pages/LoginPage.tsx` | Tela de login |
| `mfe_auth/RegisterPage` | `src/pages/RegisterPage.tsx` | Tela de cadastro |
| `mfe_auth/AccountPage` | `src/pages/AccountPage.tsx` | Tela de conta |
| `mfe_auth/ForgotPasswordPage` | `src/pages/ForgotPasswordPage.tsx` | Recuperar senha |

**URL padrão (dev):** `http://localhost:4001/assets/remoteEntry.js`

**Consumo no Shell:**
```jsx
const LoginPage = lazy(() => import('mfe_auth/LoginPage'));

<Route path="/login" element={
  <Suspense fallback={<p>Carregando...</p>}>
    <LoginPage onLogin={() => navigate('/home')} />
  </Suspense>
} />
```

---

## Como testar manualmente

1. Suba a stack: `cd chave-infra-main && make setup`
2. Acesse `http://localhost:3000`
3. Clique em "Cadastre-se" → preencha nome, e-mail, senha → "Cadastrar"
4. Faça login com as credenciais cadastradas
5. Veja os dados na tela "Minha Conta"
6. Clique em "Sair" — deve voltar para o login
7. Tente login com senha errada → deve aparecer alerta vermelho
8. Swagger: `http://localhost:3001/docs`
