## TODO List - Version(0.13.17)

### Event 
- [x] Deve ser possivel criar um evento
    * [x] Validar data/hora de início e fim (início < fim)
    * [x] Gerar slug único e imutável
    * [x] Rejeitar criação inválida com erro apropriado
    * [x] Bloquear a criação de eventos muitos curtos
- [x] Deve ser Possivel buscar um evento pelo Slug
- [x] Deve Ser possivel atualizar o banner do evento
    * [x] Verificar se evento está ativo ou no futuro
    * [x] Bloquear atualização se evento estiver encerrado
- [x] Deve ser possivel atualizar o status de um evento
    * [x] Implementar operação administrativa de status
    * [ ] Validar consistência com regra temporal


### Lead 
- [x] Deve ser possivel criar um lead
    * [x] Verificar se evento está ativo no momento da criação
    * [ ] Garantir operação atômica
- [x] Deve ser possivel listar leads de um evento
    * [ ] Adicionar paginação configurável
    * [ ] Implementar filtros por período
    * [ ] Ordenar resultados por timestamp
    * [ ] Ordenar resultados por interesse
    * [ ] Garantir retorno paginado consistente
- [x] Deve ser possivel exportar leads de um evento
    * [ ] Rejeitar exportação se evento não tiver leads
    * [ ] Garantir que exportação não bloqueie UI
    * [ ] Implementar criação de job assíncrono de exportação
    * [ ] Vincular job ao eventId


### Metrics 
- [x] Deve ser possivel calcular o total de leads por hora
    * [] Implementar consulta de leads por janela de tempo
    * [x] Garantir resposta determinística para o período solicitado
    * [ ] Otimizar para alto volume (pré-agregação)
    * [ ] Garantir latência dentro do limite definido no NFR
- [x] Deve ser possivel obter a media de captura de leads por evento
    * [x] Definir e documentar fórmula de cálculo
    * [x] Considerar apenas tempo ativo do evento
- [x] Deve ser possivel obter um resumo consolidado do evento
    * [x] Calcular total de leads no período do evento
    * [x] Calcular leads na hora atual
    * [x] Calcular status do evento (ativo/encerrado)
- [x] Deve ser possivel listar o total de leads agrupados por origem
    * [x] Retornar contagem total de leads por origem
    * [x] Ordenar resultados por contagem (descendente)
- [x] Deve ser possivel calcular o total de leads agrupados por turma 
    * [x] Retornar contagem total de leads por turma
    * [x] Ordenar resultados por contagem (descendente)
- [x] Deve ser possivel calcular o total de leads agrupados por tecnico
    * [x] Retornar contagem total de leads por turma
    * [x] Ordenar resultados por contagem (descendente)


# RF — PRINTER

### Printer
- [x] Deve ser possível registrar uma impressora
  * [x] Registrar impressora com identificador único (printerId)
  * [ ] Definir status inicial da impressora (online | offline)
  * [x] Persistir metadados básicos (nome, localização, tipo)
- [x] Deve ser possível listar impressoras
  * [ ] Retornar lista paginada de impressoras
  * [ ] Permitir filtro por status (online/offline)
  * [x] Retornar total de registros
- [x] Deve ser possível consultar a fila de impressão por impressora
  * [x] Retornar jobs associados a um printerId
  * [ ] Filtrar por status do job (pending, processing, failed)
  * [ ] Implementar paginação configurável
  * [ ] Retornar contagem total de jobs por status


### JOB 
- [ ] Deve ser possível obter métricas dos jobs de impressão
    * [ ] Retornar contagem total de jobs
    * [ ] Retornar contagem por status: pending, processing, failed, done
    * [ ] Retornar contagem por printerId
    * [ ] Retornar contagem por período (ex.: últimas 24h, 7d, intervalo customizável)
    * [ ] Suportar filtros por status, printerId, eventId e intervalo de datas
    * [ ] Suportar paginação e ordenação nos resultados
    * [ ] Definir e documentar critérios de aceitação e SLAs de latência
- [ ] Deve ser possível solicitar uma impressão de forma assíncrona
  * [ ] Validar existência da impressora
  * [ ] Validar payload de impressão (formato e tamanho)
  * [ ] Verificar disponibilidade lógica da impressora
  * [ ] Criar solicitação de impressão vinculada a uma transação de origem
- [ ] Deve ser possível processar solicitações de impressão de forma assíncrona
  * [ ] Processar jobs em ordem lógica de prioridade
  * [ ] Garantir execução isolada por job
  * [ ] Registrar resultado da execução (sucesso ou falha)
  * [ ] Registrar tempo de execução e tentativa atual
- [ ] Deve ser possível pausar e retomar o processamento de impressão
  * [ ] Bloquear início de novos processamentos quando pausado
  * [ ] Permitir retomada sem perda de jobs pendentes
  * [ ] Garantir que jobs em execução não sejam interrompidos
- [ ] Deve ser possível consultar o status de uma solicitação de impressão
  * [ ] Retornar status atual do job (pending, processing, done, failed)
  * [ ] Retornar histórico de tentativas
  * [ ] Retornar mensagem de erro da última falha, se existir
  * [ ] Retornar timestamps relevantes (criação, início, conclusão)
- [ ] Deve ser possível cancelar uma solicitação de impressão pendente
  * [ ] Bloquear cancelamento de jobs em processamento
- [ ] Deve ser possível reprocessar manualmente uma solicitação de impressão
  * [ ] Permitir reprocessamento apenas de jobs falhos
  * [ ] Criar nova tentativa vinculada ao job original
- [ ] Deve ser bloqueada a criação de solicitações de impressão para impressoras indisponíveis
  * [ ] Validar status lógico da impressora no momento da solicitação
  * [ ] Retornar erro explícito informando indisponibilidade
- [ ] Deve ser possível priorizar solicitações de impressão
  * [ ] Definir prioridade no momento da solicitação
  * [ ] Permitir reordenação manual de jobs pendentes
  * [ ] Garantir que reordenação seja atômica
  * [ ] Registrar auditoria da alteração
  * [ ] Bloquear reordenação de jobs em estados não permitidos


