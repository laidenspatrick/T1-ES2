# Manual de UI — chave-mfe-auth

## Visão Geral

O `chave-mfe-auth` é o microfrontend de autenticação do Projeto Chave. Expõe três páginas via Module Federation e oferece interface visual em Material UI (MUI) para registro, login e visualização de conta.

---

## Telas

### 1. Tela de Login (`/login`)

**Componente:** `LoginPage`

**Descrição:** Permite que usuários existentes autentiquem com email e senha.

**Elementos visuais:**
- Ícone de cadeado centralizado em fundo azul
- Título "Entrar"
- Campo de email (obrigatório)
- Campo de senha (obrigatório)
- Botão "Entrar" (desabilitado durante requisição)
- Link "Cadastre-se" (navega para registro, se prop fornecida)
- Alerta vermelho em caso de erro (ex: "Credenciais inválidas")

**Props:**
| Prop | Tipo | Descrição |
|---|---|---|
| `onLogin` | `(token: string) => void` | Callback chamado após login bem-sucedido |
| `onNavigateRegister` | `() => void` | Callback para navegar ao cadastro |

---

### 2. Tela de Cadastro (`/register`)

**Componente:** `RegisterPage`

**Descrição:** Permite criar uma nova conta de usuário.

**Elementos visuais:**
- Ícone de cadeado centralizado
- Título "Criar Conta"
- Campo de nome completo (mínimo 2 caracteres)
- Campo de email
- Campo de senha (mínimo 6 caracteres, com helper text)
- Botão "Criar Conta" (desabilitado durante requisição)
- Link "Fazer login"
- Alerta verde de sucesso após cadastro
- Alerta vermelho em caso de erro

**Props:**
| Prop | Tipo | Descrição |
|---|---|---|
| `onRegister` | `() => void` | Callback chamado após cadastro bem-sucedido |
| `onNavigateLogin` | `() => void` | Callback para voltar ao login |

---

### 3. Tela de Minha Conta (`/account`)

**Componente:** `AccountPage`

**Descrição:** Exibe os dados do usuário autenticado e permite logout.

**Elementos visuais:**
- Ícone de pessoa centralizado
- Título "Minha Conta"
- Nome do usuário
- Email do usuário
- Perfil (chip colorido: azul para USER, vermelho para ADMIN)
- Data de criação da conta (formato pt-BR)
- Botão "Sair" em vermelho
- Spinner de carregamento enquanto busca dados
- Alerta de erro se falhar ao buscar dados

**Props:**
| Prop | Tipo | Descrição |
|---|---|---|
| `onLogout` | `() => void` | Callback chamado após logout |

---

## Componentes Reutilizáveis

### `AuthCard`

Wrapper de layout para as páginas de autenticação. Centraliza conteúdo na tela com um card branco arredondado.

**Props:**
| Prop | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Título exibido no topo do card |
| `children` | `ReactNode` | Conteúdo do card |

### `AlertMessage`

Exibe um alerta MUI condicionalmente. Não renderiza nada se `message` for `null`.

**Props:**
| Prop | Tipo | Descrição |
|---|---|---|
| `message` | `string \| null` | Mensagem a exibir |
| `severity` | `'error' \| 'success' \| 'warning' \| 'info'` | Tipo do alerta (padrão: `'error'`) |

---

## Fluxo de Autenticação

```
Usuário abre o shell
       │
       ▼
[Tem access_token no localStorage?]
       │
  Não  │  Sim
       │    └──────────────────────► AccountPage
       ▼                                  │
  LoginPage ◄─────────────── Clica em "Sair"
       │
  Preenche email/senha
       │
  POST /auth/login ──► sucesso ──► salva tokens ──► AccountPage
       │                                               │
       └──► erro ──► exibe alerta vermelho             │ GET /auth/me (busca dados)
                                                       │
  LoginPage ◄────── clearTokens() ◄────── Logout ◄────┘
```

---

## Como Testar Manualmente

### Pré-requisito
O microsserviço `chave-ms-auth` deve estar rodando em `http://localhost:3001`.

### Fluxo de teste

1. **Cadastrar usuário:**
   - Acesse `http://localhost:3000`
   - Clique em "Cadastre-se"
   - Preencha nome, email e senha (mínimo 6 chars)
   - Clique em "Criar Conta"
   - Deve aparecer alerta verde de sucesso
   - Automaticamente redireciona para login

2. **Fazer login:**
   - Preencha email e senha cadastrados
   - Clique em "Entrar"
   - Deve ir para a tela "Minha Conta"

3. **Verificar dados da conta:**
   - Veja seu nome, email, perfil (USER) e data de cadastro
   - O chip de perfil é azul para USER

4. **Teste de erro:**
   - Volte ao login (faça logout)
   - Tente logar com senha errada
   - Deve aparecer alerta vermelho "Credenciais inválidas"

5. **Logout:**
   - Na tela de conta, clique em "Sair"
   - Volta para a tela de login
   - O token é removido do localStorage

### Verificar tokens no DevTools
- Abra DevTools → Application → Local Storage → localhost:3000
- Veja `access_token` e `refresh_token` após login
- Confirme que são removidos após logout

---

## Module Federation

O MFE expõe três componentes remotos:

| Export | Caminho | Descrição |
|---|---|---|
| `mfe_auth/LoginPage` | `./src/pages/LoginPage` | Página de login |
| `mfe_auth/RegisterPage` | `./src/pages/RegisterPage` | Página de cadastro |
| `mfe_auth/AccountPage` | `./src/pages/AccountPage` | Página de conta |

**URL do remoteEntry em produção:** `http://localhost:4001/assets/remoteEntry.js`