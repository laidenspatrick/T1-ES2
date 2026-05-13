# ADR 0006 — Module Federation para Microfrontends

**Status:** Aceito  
**Data:** 2025-03

---

## Contexto

O Shell (aplicação host) precisa consumir componentes de autenticação do MFE sem empacotar o código no mesmo bundle. Isso permite que o MFE seja atualizado e deployado de forma independente, sem recompilar o Shell.

O ecossistema usa Vite como bundler principal.

---

## Decisão

Usar **Module Federation** via plugin `@originjs/vite-plugin-federation`. O MFE expõe seus componentes via `remoteEntry.js`; o Shell consome esses componentes com `lazy(() => import('mfe_auth/LoginPage'))`.

---

## Consequências

- O Shell precisa da URL do `remoteEntry.js` em tempo de build (`MFE_AUTH_URL` env var)
- Em desenvolvimento, ambos os servidores precisam estar rodando (MFE na porta 4001, Shell na 3000)
- `shared: ['react', 'react-dom']` evita que React seja carregado duas vezes
- Hot reload entre Shell e MFE não funciona nativamente — requer rebuild do MFE

---

## Trade-offs

| Alternativa descartada | Motivo |
|------------------------|--------|
| **iframe** para isolar o MFE | Isolamento total, mas sem comunicação de estado (tokens, callbacks); UI fragmentada; não acessível |
| **NPM package** (publicar MFE como biblioteca) | Requer publicação e versionamento explícito a cada mudança; perde a independência de deploy que é o ponto principal dos MFEs |
| **Single SPA** framework | Abstração mais robusta para MFE, mas adiciona uma camada de indireção desnecessária quando Module Federation já resolve o problema; overhead de configuração maior |
