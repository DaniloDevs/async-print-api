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

- [ ] Deve ser possível identificar dispositivos de impressão disponíveis no ambiente configurado
- [ ] Deve ser possível registrar e configurar uma impressora para uso no sistema
  - incluindo parâmetros mínimos de conexão e identificação
- [ ] Deve ser possível consultar o status atual de uma impressora configurada
  - considerando disponibilidade, conectividade e prontidão para impressão
- [ ] Deve ser possível executar um teste de impressão em uma impressora configurada
  - com o objetivo de validar comunicação e funcionamento básico do dispositivo



# Requisitos Não Funcionais

* [ ] Listagens de eventos, leads e dispositivos de impressão devem suportar **paginação configurável**
* [ ] As operações de criação e atualização de eventos e leads devem responder em até **300ms** em condições normais de carga
* [ ] A consulta de métricas por período deve ser otimizada para eventos com **alto volume de leads**, evitando processamento linear desnecessário
* [ ] A exportação de leads deve ser executada de forma **assíncrona** para evitar bloqueio da aplicação
* [ ] O sistema deve suportar eventos com **milhares de leads** sem degradação significativa de desempenho
* [ ] O módulo de métricas deve permitir evolução para **pré-aggregações** ou cálculo em banco de dados sem quebra de contrato
* [ ] O status de um evento deve ser determinado exclusivamente por regras temporais claras e determinísticas
* [ ] Falhas na integração com dispositivos de impressão não devem impactar funcionalidades centrais do sistema
* [ ] Todas as operações críticas (criação de lead, exportação, cálculo de métricas, testes de impressão) devem gerar **logs estruturados**
* [ ] Erros devem ser rastreáveis por **eventId** ou **printerId**, quando aplicável
* [ ] O sistema deve degradar graciosamente quando dispositivos de impressão estiverem indisponíveis