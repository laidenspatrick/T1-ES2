# Architecture Decision Record (ADR) 001: Stack Tecnológica e Arquitetura Base

## Contexto
O projeto consiste no desenvolvimento de um sistema que exige alta escalabilidade, com divisão de responsabilidades claras entre frontend e backend. A primeira entrega (T1) requer a definição da arquitetura base, contemplando autenticação, integração de microsserviços, e uma interface construída sob o paradigma de microfrontends. 

## Decisão
Foi definido o uso da seguinte stack e arquitetura de software:

1. **Backend (Microsserviço de Autenticação)**
   - **Framework:** Node.js com Express.
   - **Banco de Dados:** PostgreSQL.
   - **Justificativa:** Node.js é leve, ideal para microsserviços e possui um ecossistema gigantesco. PostgreSQL garante confiabilidade ACID e robustez como banco relacional para persistência de dados críticos como autenticação de usuários.
   - **Segurança:** Adoção de `bcrypt` para hashing de senhas. Futuramente, será acoplado o fluxo de JWT.

2. **Infraestrutura e Provisionamento**
   - **Ferramentas:** Docker, LocalStack e Terraform.
   - **Justificativa:** Simula o ambiente em nuvem da AWS localmente usando contêineres, barateando e acelerando o processo de desenvolvimento. O Terraform permite a infraestrutura como código (IaC), permitindo criar bancos e APIs de forma reproduzível.

3. **Frontend (Microfrontends - MFE)**
   - **Bibliotecas e Ferramentas:** React, Vite, e Module Federation (`@originjs/vite-plugin-federation`).
   - **Justificativa:** React pela sua componentização modular. Vite pela velocidade de build absurda em comparação ao Webpack antigo. Module Federation por permitir a quebra da aplicação em múltiplos pedaços independentes (Shell e Autenticação), facilitando o trabalho paralelo de diferentes equipes.

4. **Integração e Entrega Contínua (CI/CD)**
   - **Ferramentas:** GitHub Actions.
   - **Justificativa:** Plataforma nativa do GitHub, simplificando a configuração de pipelines sem depender de ferramentas de terceiros como Jenkins.

## Status
Aceito.

## Consequências (Trade-offs)
- **Vantagens:** Escalabilidade vertical e horizontal independente entre backend e as fatias do frontend. Infraestrutura controlada e versionável.
- **Desvantagens:** Maior complexidade na configuração inicial (especialmente no Module Federation em ambiente de desenvolvimento) e dependência de orquestração local pesada (Docker com LocalStack).
