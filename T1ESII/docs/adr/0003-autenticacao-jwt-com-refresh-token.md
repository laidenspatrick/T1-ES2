# ADR 0003 — Autenticação JWT com Refresh Token

**Status:** Aceito  
**Data:** 2025-03

---

## Contexto

O sistema Chave exige que usuários (pessoas idosas e administradores) permaneçam autenticados por sessões confortavelmente longas, sem comprometer a segurança. Um access token de longa duração seria revogável apenas com reemissão completa; um token de curta duração sem refresh forçaria login frequente — experiência ruim para o público-alvo.

---

## Decisão

Usar **JWT stateless** para o access token (expiração 15 minutos) combinado com **refresh token de 7 dias** armazenado com hash SHA-256 na tabela `refresh_tokens`, permitindo revogação explícita no logout.

Dois secrets distintos: `JWT_SECRET` (access) e `JWT_REFRESH_SECRET` (refresh) para isolar o risco.

---

## Consequências

- Tabela `refresh_tokens` deve ser mantida limpa (tokens expirados podem ser removidos periodicamente)
- Logout é efetivo: o token é deletado do banco, impossibilitando reuso
- O interceptor axios no MFE tenta refresh automático em 401, transparente para o usuário
- Access token contém `sub`, `email` e `role` — evita consulta ao banco a cada request

---

## Trade-offs

| Alternativa descartada | Motivo |
|------------------------|--------|
| **Sessions com cookies httpOnly** | Requer estado no servidor (Redis/DB por sessão) e configuração de CORS+cookie cross-origin; mais complexo para ambiente de MFE distribuído com portas distintas (3000, 4001, 3001) |
| **JWT de longa duração sem refresh** | Sem mecanismo de revogação; se o token vazar, o usuário fica exposto até a expiração — inaceitável para dados sensíveis de autoavaliação |
| **OAuth2/OpenID Connect externo** | Correto para produção, mas introduz dependência de provedor externo (Keycloak, Auth0) que ultrapassa o escopo do T1 acadêmico |
