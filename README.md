# Async Print API - Version(0.13.17)

Orchestrator for in-person event management, participant (lead) capture, and asynchronous thermal printing. A complete solution for corporate events that require traceability, scalability, and fault tolerance.

## 📋 About

The **Async Print API** is an event orchestration platform built to manage the complete flow of in-person events, from event configuration to the issuance of raffle receipts. The project uses an **event- and domain-based** architecture with three main pillars:

### Key Features

**📅 Event & Lead Management**
- Create events with unique and immutable slugs
- Capture participants (leads) immutably and atomically
- List leads with pagination, temporal filters, and grouping
- Export leads asynchronously
- Update banner only while the event is active/future
- Event status automatically derived from current time

**📊 Metrics Analysis**
- Leads captured per period (deterministic time windows)
- Average capture rate considering only active time
- Consolidated summary with total leads and real-time status
- Grouping by origin and interest segment

**🖨️ Print Queue & Jobs**
- Asynchronous queuing of print requests
- FIFO processing with priority support
- Attempt history and failure handling
- Tolerance for offline printers without impacting capture
- Queue monitoring dashboard (Bull Board)
- Support for reprocessing and manual cancellation of jobs

---

## 🚀 Technologies

This project was developed with the following technologies:

- [Node.js 20+](https://nodejs.org/) - JavaScript/TypeScript runtime
- [TypeScript 5.9](https://www.typescriptlang.org/) - Static typing and security
- [Fastify 5](https://www.fastify.io/) - Modern and highly performant web framework
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Prisma 7](https://www.prisma.io/) - Type-safe ORM for Node.js
- [BullMQ](https://docs.bullmq.io/) - Redis-based job queue for asynchronous processing
- [Bull Board](https://bull-board.js.org/) - Dashboard for queue monitoring
- [MinIO](https://min.io/) - S3-compatible storage
- [Zod](https://zod.dev/) - Schema and type validation
- [Vitest 4](https://vitest.dev/) - Unit and E2E testing framework
- [Biome 2](https://biomejs.dev/) - Unified linter and formatter
- [Scalar](https://scalar.com/) - Interactive API documentation

---

## 🎯 Business Rules (Invariants)

1. **Events**: Status is automatically derived from the current time; cannot be set manually
2. **Leads**: Immutable after creation; can only be captured while the event is active
3. **Exports**: Always asynchronous; require ≥1 lead in the event
4. **Metrics**: Read-only; never affect capture operations
5. **Printers**: Offline status does not block the system; jobs are rejected with a clear reason
6. **Jobs**: Idempotent and linked to the same origin transaction
7. **Fault Tolerance**: Printing failures never impact lead capture
8. **Audit**: Structured logs (JSON) are mandatory for all operations

---

## ⚙️ Non-Functional Requirements

- **Performance**: Event/lead creation ≤ 300ms under normal load
- **Pagination**: Cursor/offset support with a default of 20 records
- **Processing**: All exports/prints are asynchronous (202 Accepted)
- **Availability**: System functions even with all printers offline
- **Traceability**: Structured logs by eventId/printerId/jobId
- **Security**: RBAC for critical operations (export, reprocess, cancel)
- **Observability**: Alerts when the queue grows beyond a configurable threshold

