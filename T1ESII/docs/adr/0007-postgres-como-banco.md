# ADR 0007 — PostgreSQL como Banco de Dados

**Status:** Aceito  
**Data:** 2025-03

---

## Contexto

O MS Auth precisa persistir usuários, hashes de senha e refresh tokens com garantias ACID (sem risco de perder um refresh token recém-inserido, por exemplo). O banco precisa ser provisionável via Docker e Terraform (simulando RDS AWS) para o ambiente de dev/T1.

---

## Decisão

Usar **PostgreSQL 15** como banco de dados relacional. Em desenvolvimento: imagem `postgres:15-alpine` no docker-compose. Em infraestrutura simulada: RDS PostgreSQL provisionado via Terraform/LocalStack.

---

## Consequências

- Schema criado automaticamente pelo `initDb()` do MS Auth no startup
- `pg` (node-postgres) como driver — sem ORM para manter o código mínimo e explícito
- A tabela `refresh_tokens` usa `REFERENCES users(id) ON DELETE CASCADE` para manter integridade
- Backup não implementado neste T1 (ambiente local apenas)

---

## Trade-offs

| Alternativa descartada | Motivo |
|------------------------|--------|
| **SQLite** | Ideal para desenvolvimento isolado, mas não replica o comportamento do RDS em produção; sem suporte nativo a múltiplas conexões concorrentes com a mesma robustez |
| **MongoDB** | Sem schema fixo é vantagem para dados flexíveis, mas usuários e tokens têm schema estável e bem definido; a ausência de JOINs nativos dificultaria futuras queries relacionais (ex: autoavaliação vinculada ao usuário) |
| **ORM (Prisma/TypeORM)** | Adicionaria complexidade de migrations e geração de código; para 2 tabelas e ~7 queries, SQL direto é mais legível e sem overhead de dependência extra |
