# ADR 0008 — Docker Compose para Ambiente Local

**Status:** Aceito  
**Data:** 2025-03

---

## Contexto

O sistema Chave tem 4 serviços que precisam estar em execução simultânea: PostgreSQL, MS Auth, MFE Auth e Shell. Desenvolvedores precisam subir o ambiente completo com um único comando, sem instalar dependências nativas (PostgreSQL, Node.js específico) na máquina.

---

## Decisão

Usar **Docker Compose** para orquestrar todos os serviços localmente. Um `Makefile` com targets (`setup`, `up`, `down`, `logs`, `health`) abstrai os comandos docker para facilitar o uso.

A infra de nuvem simulada (LocalStack + Terraform) fica no módulo `chave-infra-main` separado, ativada opcionalmente via `make tf-apply`.

---

## Consequências

- `docker-compose up -d --build` sobe todo o ambiente em ~2 minutos
- Health check do PostgreSQL garante que o MS Auth só inicia após o banco estar pronto
- Build da imagem Node é multi-stage (deps separadas da runtime) para minimizar tamanho
- Qualquer desenvolvedor com Docker instalado pode rodar o projeto sem configuração extra

---

## Trade-offs

| Alternativa descartada | Motivo |
|------------------------|--------|
| **Kubernetes local (minikube/k3d)** | Replicação mais fiel do ambiente de produção, porém complexidade operacional muito alta para desenvolvimento acadêmico; overhead de tempo de setup inviabiliza o uso no T1 |
| **Scripts bash de instalação** (instalar Postgres nativo, nvm, etc.) | Depende da plataforma; gera divergências entre máquinas dos integrantes; não é reproduzível; conflita com outras versões instaladas |
| **Dev Containers (VSCode)** | Boa experiência integrada ao editor, mas exclui desenvolvedores que não usam VSCode e adiciona overhead de configuração do devcontainer.json para cada serviço |
