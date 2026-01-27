# PRD Final — **Async Print**

**Visão geral curta**
Sistema para gestão de eventos, captura/exportação de leads e impressão assíncrona via filas. O domínio principal são *Events & Leads*; *Metrics* e *Printing & Jobs* são subdomínios conectados — cada um com invariantes e responsabilidades claras. Este PRD formaliza regras de negócio, requisitos funcionais e não funcionais, critérios de aceitação e riscos/mitigações para entrega consistente e auditável.

---

# 1. Escopo do produto

* Captura e armazenamento de leads associados a eventos.
* Cálculo e disponibilização de métricas por período e resumo consolidado.
* Exportação assíncrona de leads (gerando jobs).
* Enfileiramento e processamento assíncrono de jobs de impressão por impressora.
* Observabilidade (logs estruturados, rastreabilidade por eventId/printerId) e tolerância a falhas de impressoras.

---

# 2. Regras de negócio (resumo objetivo)

> Regras enunciadas como invariantes que o sistema deve garantir.

## Eventos

1. Evento é **ativo** apenas durante seu intervalo temporal; status é **derivado** desse intervalo (não manual).
2. Leads só podem ser criados enquanto o evento estiver ativo.
3. Banner não pode ser alterado após o evento estar encerrado.
4. Slug é único e imutável depois de publicado.
5. Exportação só é permitida se houver ≥1 lead.
6. Eventos encerrados permanecem consultáveis (histórico) — não removem leads.

## Leads

7. Lead pertence a exatamente um evento.
8. Lead captura registra timestamp imutável; contagens baseiam-se nesse timestamp.
9. Leads são **imutáveis** (registro histórico).
10. Criação de lead é atômica: ou persiste inteiramente ou não persiste.

## Métricas

11. Métricas apenas leem estado — não modificam.
12. Status do evento para métricas é **calculado** a partir do horário atual + período do evento.
13. Janelas temporais são fechadas e determinísticas (reprodutibilidade).
14. Taxa média de captura considera apenas o tempo ativo do evento.
15. Métricas não dependem de impressoras/jobs e não podem bloquear operações de captura.

## Impressoras / Jobs de Impressão

16. Impressora só recebe jobs se estiver *disponível*; impressoras indisponíveis rejeitam, não bloqueiam o sistema.
17. Cada job está associado a uma única impressora e a uma entidade de negócio de origem (event/export).
18. Jobs processados em ordem FIFO por impressora, salvo prioridade explícita.
19. Jobs não mudam de impressora após criação.
20. Jobs cancelados não podem ser processados; jobs concluídos são imutáveis.
21. Falhas de impressão registram causa e tentativa; número máximo de tentativas é configurável.
22. Formato de documento incompatível invalida job **antes** do processamento.

## Jobs Assíncronos (genéricos)

23. Todo job representa uma intenção de negócio válida e deve ser criado dentro da mesma transação que originou a intenção (garantir consistência/traceabilidade).
24. Jobs não podem produzir efeitos colaterais duplicados — idempotência ou deduplicação é obrigatória.
25. Jobs falhados permanecem visíveis para reprocessamento manual; histórico de tentativas é preservado.
26. Desabilitar um tipo de job impede novos jobs, preserva histórico existente.

## Regras transversais

27. Falhas de impressão **nunca** impactam a captura de leads.
28. Logs estruturados e rastreáveis por `eventId`/`printerId` são obrigatórios.
29. O sistema deve continuar funcional com todas as impressoras offline.
30. Performance (p.ex. 300ms para criação/atualização em condições normais) é requisito de negócio.

---

# 3. Requisitos Funcionais (com critérios de aceitação)

## Events & Leads

* **RF1** Criar evento.
  *AC:* 201 Created, slug único. Evento com início/fim válidos.
* **RF2** Buscar evento por slug.
  *AC:* 200 OK com dados; 404 se não existir; slug imutável.
* **RF3** Atualizar banner (somente se evento ativo ou futuro).
  *AC:* 200 OK; 403/422 se evento encerrado.
* **RF4** Atualizar status do evento — *apenas* operação administrativa que **não** pode contradizer regra temporal (preferir derivação automática).
  *AC:* sistema rejeita status manual ilegal.
* **RF5** Criar lead para evento.
  *AC:* 201 Created se evento ativo; 422/403 se fora do intervalo; operação atômica.
* **RF6** Listar leads por evento (paginação configurável).
  *AC:* retorno paginado, filtros por período, ordenação por timestamp.
* **RF7** Exportar leads (gera job assíncrono).
  *AC:* cria export job ligado ao eventId; 202 Accepted com exportId; rejeita se 0 leads.

## Metrics

* **RF8** Leads por período (ex.: por hora).
  *AC:* resposta determinística para janela solicitada; latência aceitável para alto volume (ver NFR).
* **RF9** Taxa média de captura por evento.
  *AC:* considera apenas tempo ativo; documentado fórmula.
* **RF10** Resumo consolidado do evento.
  *AC:* total leads no período do evento, leads na hora atual, status calculado (ativo/encerrado).

## Printer Device & Printing Jobs

* **RF11** Enfileirar solicitação de impressão (assíncrona).
  *AC:* cria job ligado a printerId; 202 Accepted; valida disponibilidade e formato.
* **RF12** Consultar fila por impressora (jobs pendentes).
  *AC:* listagem paginada e contagem.
* **RF13** Priorizar/reordenar jobs (quando aplicável).
  *AC:* operação atômica com auditoria de reordenação.
* **RF14** Ver status do job (pendente, processing, done, failed) e histórico de tentativas.
  *AC:* endpoint retorna status, tentativas, último erro.
* **RF15** Reprocessar manual / cancelar job pendente.
  *AC:* só para jobs em estados permitidos; registra operador.
* **RF16** Impedir envio de job para impressora indisponível.
  *AC:* 409 Conflict ou similar com razão.

## Jobs 

* **RF17** Criar/enfileirar job com tipo e payload.
  *AC:* job criado com idempotência opcional; vinculada à transação origem.
* **RF18** Workers processam jobs assíncronos com controle de concorrência por tipo.
  *AC:* limite configurável por tipo; métricas de taxa de sucesso/falha expostas.
* **RF19** Pausar/retomar filas; desabilitar tipos de job.
  *AC:* mudanças respeitam jobs em processamento; novas criações bloqueadas quando aplicável.



# 4. Requisitos Não Funcionais (metas mensuráveis)

* **NFR1** Criação/atualização de eventos e leads: ≤ 300 ms (pico normal).
* **NFR2** Listagens: paginação configurável com cursor/offset; P0 = 20 / P1 configurable.
* **NFR3** Métricas: projetadas para alto volume (pré-aggregação), consultas de 95p < 1s para ranges típicos.
* **NFR4** Exportações/impressões: sempre assíncronas e desacopladas da UI.
* **NFR5** Tolerância a falhas: impressoras offline não degradam captura.
* **NFR6** Logs: estruturados (JSON), contendo eventId/exportId/printerId/jobId/traceId.
* **NFR7** Segurança: autenticação/authorization RBAC para operações críticas (export, reprocessar, cancelar).
* **NFR8** Observabilidade: métricas por fila (pending, success rate, failure rate), alertas quando fila cresce além de threshold.


