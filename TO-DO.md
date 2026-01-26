# Async Print

# Requisitos Funcionais

## **Events**

- [x] Deve ser possivel criar um evento
- [x] Deve ser possivel criar um lead de um evento
- [x] Deve ser possivel atualizar o banner de um evento
- [x] Deve ser possivel buscar um evento pelo slug
- [x] Deve ser possivel exportar leads de um evento
- [x] Deve ser possivel listar leads de um evento
- [x] Deve ser possivel atualizar o status do evento

## **Metrics**

- [x] Deve ser possível obter métricas de leads por período (ex: leads por hora)
- [] Deve ser possível calcular a taxa média de captura de leads por evento
- [] Deve ser possível obter um resumo consolidado de métricas de um evento, contendo obrigatoriamente:
    - total de leads capturados no período do evento
    - quantidade de leads capturados na hora atual
    - status atual do evento (ativo ou encerrado), determinado a partir do horário atual e do período do evento

## **Printer Device**

- [ ] Deve ser possível enviar solicitações de impressão para processamento assíncrono via fila de jobs
- [ ] Cada solicitação de impressão deve gerar um job associado a uma impressora específica
- [ ] Deve ser possível correlacionar um job de impressão a uma entidade do domínio (ex: exportação de leads, evento)
- [ ] Deve ser possível manter uma fila de impressão por impressora configurada
- [ ] Deve ser possível consultar a quantidade de jobs pendentes por impressora
- [ ] Deve ser possível reordenar ou priorizar jobs de impressão quando aplicável
- [ ] Deve ser possível consultar o status de uma solicitação de impressão
  - pendente
  - em processamento
  - concluída
  - falhada
- [ ] Deve ser possível identificar o motivo de falha de uma impressão
- [ ] Deve ser possível rastrear tentativas de impressão realizadas para um mesmo job
- [ ] Deve ser possível configurar tentativas automáticas de reimpressão em caso de falha
- [ ] Deve ser possível reprocessar manualmente uma solicitação de impressão falhada
- [ ] Deve ser possível cancelar uma solicitação de impressão que ainda não foi processada
- [ ] O sistema deve impedir o envio de jobs de impressão para impressoras em estado indisponível
- [ ] Deve ser possível validar a compatibilidade do formato do documento antes da impressão
- [ ] Impressoras inativas não devem bloquear o processamento de outras filas ou funcionalidades do sistema
- [ ] Deve ser possível obter histórico de impressões por impressora
- [ ] Deve ser possível filtrar impressões por período, status ou entidade associada
- [ ] Deve ser possível identificar impressões relacionadas a eventos específicos


### **Jobs**

- [ ] Deve ser possível criar e enfileirar um job assíncrono informando:
  - tipo do job
  - payload necessário para execução
- [ ] Deve ser possível processar jobs de forma assíncrona por workers dedicados
- [ ] Deve ser possível definir a concorrência máxima de processamento por tipo de job
- [ ] Deve ser possível consultar o status atual de um job
  - pendente
  - em processamento
  - concluído
  - falhado
- [ ] Deve ser possível identificar o motivo da falha de um job
- [ ] Deve ser possível configurar tentativas automáticas de reprocessamento em caso de falha
- [ ] Deve ser possível reprocessar manualmente um job falhado
- [ ] Deve ser possível cancelar um job que ainda não foi processado
- [ ] Deve ser possível pausar e retomar o processamento de filas específicas
- [ ] Deve ser possível desabilitar temporariamente a execução de um tipo de job
- [ ] Deve ser possível listar jobs por:
  - status
  - tipo
  - período de criação
- [ ] Deve ser possível correlacionar jobs a entidades do domínio (ex: eventId, exportId)
- [ ] Deve ser possível visualizar métricas básicas por fila:
  - quantidade de jobs pendentes
  - taxa de sucesso/falha
- [ ] Deve ser possível garantir que a criação de um job esteja vinculada a uma transação de negócio
- [ ] Deve ser possível executar ações pós-processamento (ex: callbacks ou eventos)



# Requisitos Não Funcionais

- [ ] Listagens de eventos, leads e dispositivos de impressão devem suportar **paginação configurável**
- [ ] As operações de criação e atualização de eventos e leads devem responder em até **300ms** em condições normais de carga
- [ ] A consulta de métricas por período deve ser otimizada para eventos com **alto volume de leads**, evitando processamento linear desnecessário
- [ ] A exportação de leads deve ser executada de forma **assíncrona** para evitar bloqueio da aplicação
- [ ] O sistema deve suportar eventos com **milhares de leads** sem degradação significativa de desempenho
- [ ] O módulo de métricas deve permitir evolução para **pré-aggregações** ou cálculo em banco de dados sem quebra de contrato
- [ ] O status de um evento deve ser determinado exclusivamente por regras temporais claras e determinísticas
- [ ] Falhas na integração com dispositivos de impressão não devem impactar funcionalidades centrais do sistema
- [ ] Todas as operações críticas (criação de lead, exportação, cálculo de métricas, testes de impressão) devem gerar **logs estruturados**
- [ ] Erros devem ser rastreáveis por **eventId** ou **printerId**, quando aplicável
- [ ] O sistema deve degradar graciosamente quando dispositivos de impressão estiverem indisponíveis
