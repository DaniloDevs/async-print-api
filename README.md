# Async Print API - Version(0.13.17)

Orquestrador de gestão de eventos presenciais, captura de participantes (leads) e impressão térmica assíncrona. Uma solução completa para eventos corporativos que necessitam de rastreabilidade, escalabilidade e tolerância a falhas.

## 📋 Sobre

A **Async Print API** é uma plataforma de orquestração de eventos construída para gerenciar o fluxo completo de eventos presenciais, desde a configuração do evento até a emissão de comprovantes para sorteios. O projeto utiliza arquitetura baseada em **eventos e domínios** com três pilares principais:

### Principais Funcionalidades

**📅 Gestão de Eventos & Leads**
- Criar eventos com slug único e imutável
- Capturar participantes (leads) de forma imutável e atômica
- Listar leads com paginação, filtros temporais e agrupamento
- Exportar leads de forma assíncrona
- Atualizar banner apenas enquanto evento está ativo/futuro
- Status de evento derivado automaticamente do horário atual

**📊 Análise de Métricas**
- Leads capturados por período (janelas temporais determinísticas)
- Taxa média de captura considerando apenas tempo ativo
- Resumo consolidado com total de leads e status em tempo real
- Agrupamento por origem e segmento de interesse

**🖨️ Fila de Impressão & Jobs**
- Enfileiramento assíncrono de solicitações de impressão
- Processamento FIFO com suporte a priorização
- Histórico de tentativas e tratamento de falhas
- Tolerância a impressoras offline sem impacto na captura
- Dashboard de monitoramento de filas (Bull Board)
- Suporte a reprocessamento e cancelamento manual de jobs

---

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- [Node.js 20+](https://nodejs.org/) - Runtime JavaScript/TypeScript
- [TypeScript 5.9](https://www.typescriptlang.org/) - Tipagem estática e segurança
- [Fastify 5](https://www.fastify.io/) - Framework web moderno e altamente performático
- [PostgreSQL](https://www.postgresql.org/) - Banco de dados relacional
- [Prisma 7](https://www.prisma.io/) - ORM type-safe para Node.js
- [BullMQ](https://docs.bullmq.io/) - Fila de jobs em Redis para processamento assíncrono
- [Bull Board](https://bull-board.js.org/) - Dashboard para monitoramento de filas
- [MinIO](https://min.io/) - Armazenamento compatível com S3
- [Zod](https://zod.dev/) - Validação de esquemas e tipos
- [Vitest 4](https://vitest.dev/) - Framework de testes unitários e E2E
- [Biome 2](https://biomejs.dev/) - Linter e formatter unificado
- [Scalar](https://scalar.com/) - Documentação interativa de API

---

## 🎯 Regras de Negócio (Invariantes)

1. **Eventos**: Status é derivado automaticamente do horário atual; não pode ser definido manualmente
2. **Leads**: Imutáveis após criação; só podem ser capturados enquanto evento está ativo
3. **Exportações**: Sempre assíncronas; requerem ≥1 lead no evento
4. **Métricas**: Apenas leitura; nunca afetam operações de captura
5. **Impressoras**: Offline não bloqueia o sistema; jobs são rejeitados com motivo claro
6. **Jobs**: Idempotentes e vinculados à mesma transação de origem
7. **Tolerância a Falhas**: Falhas de impressão nunca impactam a captura de leads
8. **Auditoria**: Logs estruturados (JSON) obrigatórios para todas as operações

---

## ⚙️ Requisitos Não Funcionais

- **Performance**: Criação de evento/lead ≤ 300ms em carga normal
- **Paginação**: Suporte a cursor/offset com default de 20 registros
- **Processamento**: Todas as exportações/impressões são assíncronas (202 Accepted)
- **Disponibilidade**: Sistema funciona com todas as impressoras offline
- **Rastreabilidade**: Logs estruturados por eventId/printerId/jobId
- **Segurança**: RBAC para operações críticas (export, reprocessar, cancelar)
- **Observabilidade**: Alertas quando fila cresce além de threshold configurável

---

## 📚 Documentação

- **Swagger/Scalar** — Documentação interativa em `/docs`
- **Bull Board** — Dashboard de monitoramento de filas em `/dashboard/jobs`


