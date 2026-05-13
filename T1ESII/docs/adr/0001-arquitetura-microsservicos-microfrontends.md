# ADR 0001 — Arquitetura de Microsserviços e Microfrontends

**Status:** Aceito  
**Data:** 2025-03

---

## Contexto

O sistema **Chave** visa apoiar a autoavaliação de competências digitais de pessoas idosas, público com necessidades específicas de acessibilidade e usabilidade. O projeto é desenvolvido por múltiplas equipes em paralelo (PUCRS + UFRGS) e deve evoluir incrementalmente no T1 → T2.

Precisamos de uma arquitetura que:
- Permita desenvolvimento paralelo por diferentes grupos
- Isole domínios funcionais (autenticação, autoavaliação, relatórios)
- Suporte substituição de peças sem reescrita total

---

## Decisão

Adotar arquitetura de **microsserviços no backend** (um serviço por domínio) combinada com **microfrontends** no frontend (Module Federation), orquestrados por um shell host.

---

## Consequências

- Cada serviço/MFE tem repositório, pipeline e deploy independentes
- Contratos entre serviços definidos por REST/OpenAPI
- Overhead operacional: múltiplos containers, múltiplos pipelines
- Complexidade de setup local resolvida pelo `docker-compose` (ver [ADR 0008](0008-docker-compose-para-ambiente-local.md))

---

## Trade-offs

| Alternativa descartada | Motivo |
|------------------------|--------|
| **Monólito único** (backend + frontend juntos) | Impede desenvolvimento paralelo; qualquer mudança afeta o sistema inteiro — risco alto para equipe distribuída |
| **Monólito modular** (backend separado, frontend único SPA) | Mais simples, mas o frontend se torna ponto único de falha; impede que equipes distintas implantem MFEs de forma independente no T2 |

A arquitetura distribuída é mais custosa inicialmente, porém alinha com o cronograma de múltiplas entregas e com a intenção de eleger o MS Auth como padrão da turma no T2.
