# ADR 0002 — Stack Backend: Node.js + Express

**Status:** Aceito  
**Data:** 2025-03

---

## Contexto

O MS Auth precisa de um servidor HTTP capaz de:
- Lidar com operações assíncronas de I/O (banco de dados, bcrypt)
- Expor API REST simples com 5–7 endpoints
- Ter Swagger gerado a partir do próprio código
- Ser containerizável e testável com supertest

A equipe tem familiaridade com JavaScript/TypeScript.

---

## Decisão

Usar **Node.js 20 LTS** com **Express 4** como framework HTTP para o microsserviço de autenticação.

---

## Consequências

- Código em JavaScript CommonJS (sem build step para o servidor)
- Express é minimalista: middleware explícito para CORS, JSON, validação
- Performance suficiente para o volume esperado (sistema acadêmico, não produto em larga escala)
- `nodemon` para hot reload em desenvolvimento

---

## Trade-offs

| Alternativa descartada | Motivo |
|------------------------|--------|
| **Fastify** | Mais performático e com schema-based validation nativa, porém curva de aprendizado adicional para a equipe; para o volume do Chave, Express é suficiente |
| **NestJS** | Framework opinionado com DI e decorators — ótimo para sistemas grandes, mas gera boilerplate excessivo para um MS com 7 endpoints; viola o princípio de implementação mínima deste T1 |
| **Python/Flask** | Ecossistema diferente do frontend (JS/TS); adiciona complexidade de manter duas linguagens |
