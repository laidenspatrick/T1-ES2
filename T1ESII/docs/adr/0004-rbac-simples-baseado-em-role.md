# ADR 0004 — RBAC Simples Baseado em Role

**Status:** Aceito  
**Data:** 2025-03

---

## Contexto

O sistema Chave tem dois perfis claros: **administradores** (coordenadores do projeto PUCRS/UFRGS) que precisam gerenciar usuários e visualizar dados agregados, e **usuários comuns** (pessoas idosas participantes) que acessam apenas sua própria autoavaliação.

---

## Decisão

Implementar **RBAC simples** com um campo `role VARCHAR DEFAULT 'user'` na tabela `users`. Valores possíveis: `'user'` e `'admin'`. O controle de acesso é feito por um middleware `requireRole(...roles)` que lê o campo `role` diretamente do payload JWT (evitando consulta ao banco por request).

---

## Consequências

- Promoção de usuário a admin requer acesso direto ao banco (sem UI de administração neste T1)
- O campo `role` fica embarcado no JWT — se o role mudar, o token antigo ainda terá o role anterior até expirar (15min)
- Endpoint `GET /auth/admin/users` demonstra o padrão para novos endpoints protegidos no T2

---

## Trade-offs

| Alternativa descartada | Motivo |
|------------------------|--------|
| **RBAC baseado em permissões granulares** (tabela `permissions`, relação M:N com roles) | Correto para sistemas com muitas permissões distintas, mas excessivo para dois perfis bem definidos; o sistema Chave não tem permissões granulares nos requisitos do T1 |
| **ACL por recurso** (cada recurso tem uma lista de usuários autorizados) | Complexidade de manutenção muito alta; não se aplica ao domínio de autoavaliação onde o acesso é majoritariamente por perfil, não por recurso individual |
