# Async Print API

Sistema completo para gestão de eventos, captura/exportação de leads e impressão assíncrona via filas. O domínio principal são *Events & Leads*; *Metrics* e *Printing & Jobs* são subdomínios conectados — cada um com invariantes e responsabilidades claras.

## 📋 Visão Geral

A Async Print API fornece:

### **Events & Leads**
- Criar eventos com slug único e imutável
- Buscar eventos por slug
- Atualizar banner (apenas se evento ativo/futuro)
- Capturar leads (registro histórico imutável e atômico)
- Listar leads com paginação, filtros temporais e agrupamento (por origem, turma)
- Exportar leads de forma assíncrona (gerando jobs)

### **Metrics**
- Leads por período (janelas temporais determinísticas)
- Taxa média de captura por evento (considerando apenas tempo ativo)
- Resumo consolidado (total, leads na hora atual, status calculado)
- Agrupamento por origem e turma de interesse

### **Printer & Jobs de Impressão**
- Enfileirar solicitações de impressão (assíncrona, 202 Accepted)
- Consultar fila por impressora (com paginação)
- Priorizar/reordenar jobs (operação atômica com auditoria)
- Verificar status (pendente, processando, concluído, falho) com histórico de tentativas
- Cancelar/reprocessar jobs manualmente
- Bloquear envio para impressoras indisponíveis (tolerância a falhas)

### **Workers Assíncronos**
- Processamento de jobs em fila (FIFO + prioridade)
- Controle de concorrência configurável por tipo
- Métricas de sucesso/falha expostas
- Pausa/retomada de filas e habilitar/desabilitar tipos de job

---

## 🎯 Regras de Negócio (Invariantes)

1. **Eventos**: Ativo apenas durante intervalo temporal; status derivado (não manual)
2. **Leads**: Imutáveis, criáveis apenas se evento ativo, pertencem a exatamente um evento
3. **Métricas**: Apenas leitura, não afetam operações de captura
4. **Impressoras**: Offline não bloqueia captura; jobs rejeitados com razão clara
5. **Jobs**: Idempotentes, vinculados à transação de origem, histórico de falhas preservado
6. **Tolerância a falhas**: Falhas de impressão **nunca** impactam captura de leads
7. **Auditoria**: Logs estruturados (JSON) com eventId, exportId, printerId, jobId, traceId

---

## 🚀 Tecnologias

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Filas**: BullMQ + Bull Board Dashboard
- **Armazenamento**: MinIO (S3 compatible)
- **Validação**: Zod
- **Testes**: Vitest
- **Qualidade**: Biome (linter/formatter)


## 📚 Estrutura do Projeto

```
src/
├── routes/              # Endpoints HTTP
│   ├── events/          # RF1-RF6 (CRUD events, criar/listar leads)
│   ├── metrics/         # RF8-RF10 (leads por período, taxa média, resumo)
│   └── printer/         # RF11-RF16 (fila, status, cancelar, reprocessar)
├── service/             # Lógica de negócio (domínio)
│   ├── create-event.ts
│   ├── register-lead.ts
│   ├── export-lead-by-event-slug.ts
│   ├── update-banner-by-event-slug.ts
│   ├── list-leads-by-event-slug.ts
│   ├── get-event-by-slug.ts
│   └── update-event-status.ts
├── repository/          # Acesso a dados (persistência)
│   ├── event.ts
│   ├── lead.ts
│   └── in-memory/       # Fallback para testes
├── jobs/                # Workers (RF17-RF19)
│   └── worker.ts
├── connections/         # Integrações
│   ├── prisma.ts        # PostgreSQL
│   ├── queue.ts         # BullMQ
│   ├── minio.ts         # MinIO
│   ├── printer.ts       # Impressoras
│   └── bull-board.ts    # Dashboard
├── provider/            # Serviços externos
│   ├── storage-provider.ts
│   └── minio/
├── _errors/             # Exceções customizadas
│   ├── event-not-started-yet-error.ts
│   ├── event-already-ended-error.ts
│   ├── lead-already-registered-error.ts
│   └── ... (mais 5)
├── env/                 # Configuração
└── utils/               # Auxiliares
```

---

## ⚙️ Requisitos Não Funcionais

- **NFR1**: Criação/atualização de eventos e leads ≤ 300ms (pico normal)
- **NFR2**: Paginação configurável (cursor/offset, default 20)
- **NFR3**: Métricas P95 < 1s para ranges típicos
- **NFR4**: Exportações/impressões sempre assíncronas
- **NFR5**: Impressoras offline não degradam captura
- **NFR6**: Logs estruturados (JSON) com rastreabilidade
- **NFR7**: RBAC para operações críticas (export, reprocessar, cancelar)
- **NFR8**: Alertas quando fila cresce além de threshold

---

## 🏗️ Status de Implementação

Veja [TO-DO.md](TO-DO.md) para detalhes de cada requisito funcional (RF1-RF19).

| Domínio | Status | Requisitos |
|---------|--------|-----------|
| **Events** | Em andamento | RF1-RF4 |
| **Leads** | Em andamento | RF5-RF7 |
| **Metrics** | Planejado | RF8-RF10 |
| **Printer** | Planejado | RF11-RF16 |
| **Jobs** | Planejado | RF17-RF19 |

---

## 📄 Referências

- [PRD.md](PRD.md) — Produto completo (regras, RF, NFR)
- [TO-DO.md](TO-DO.md) — Checklist de implementação
