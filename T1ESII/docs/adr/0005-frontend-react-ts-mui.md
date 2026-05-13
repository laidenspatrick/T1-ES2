# ADR 0005 — Frontend: React + TypeScript + MUI

**Status:** Aceito  
**Data:** 2025-03

---

## Contexto

O MFE de autenticação precisa de:
- Interface visual acessível (público idoso: fonte grande, contraste alto, botões grandes)
- Componentes de formulário com validação e feedback imediato
- Design system consistente sem CSS manual
- Tipagem estática para evitar bugs de integração com o MS Auth

---

## Decisão

Usar **React 18** com **TypeScript strict** (`strict: true` em `tsconfig.json`) e **Material UI (MUI) v5** como design system. Validação de formulários com **react-hook-form**.

O tema MUI é configurado com `typography.fontSize: 16` para garantir legibilidade para o público idoso e contraste AA (WCAG 2.1).

---

## Consequências

- Toda lógica de UI é tipada — erros de integração detectados em compilação
- MUI fornece componentes acessíveis por padrão (`label` associado, ARIA)
- react-hook-form reduz re-renders desnecessários comparado a state não controlado
- Zero CSS customizado — manutenção mais simples

---

## Trade-offs

| Alternativa descartada | Motivo |
|------------------------|--------|
| **Tailwind CSS** sem design system | Flexível, mas exige definição manual de cada componente; para público idoso seria necessário recriar acessibilidade que o MUI já oferece out-of-the-box |
| **Angular** com Angular Material | Ecossistema diferente do restante da turma; curva de aprendizado maior; não há ganho mensurável para o escopo do T1 |
| **Formulários com estado local (`useState`)** em vez de react-hook-form | Gera re-renders por keystroke; sem padrão de validação unificado; react-hook-form é a escolha padrão do ecossistema React para formulários complexos |
