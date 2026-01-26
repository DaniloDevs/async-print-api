## TODO List

### Event 
- [] Deve ser possivel criar um evento
    * [] Validar data/hora de início e fim (início < fim)
    * [] Gerar slug único e imutável
    * [] Rejeitar criação inválida com erro apropriado
- [] Deve ser Possivel buscar um evento pelo Slug
    * [] Garantir slug imutável após criação
- [] Deve Ser possivel atualizar o banner do evento
    * [ ] Verificar se evento está ativo ou no futuro
    * [ ] Bloquear atualização se evento estiver encerrado
- [] Deve ser possivel atualizar o status de um evento
    * [ ] Implementar operação administrativa de status
    * [ ] Validar consistência com regra temporal


### Lead 
- [] Deve ser possivel criar um lead
    * [ ] Verificar se evento está ativo no momento da criação
    * [ ] Garantir operação atômica
- [] Deve ser possivel listar leads de um evento
    * [ ] Implementar listagem de leads por eventId
    * [ ] Adicionar paginação configurável
    * [ ] Implementar filtros por período
    * [ ] Ordenar resultados por timestamp
    * [ ] Garantir retorno paginado consistente
- [] Deve ser possivel exportar leads de um evento
    * [ ] Rejeitar exportação se evento não tiver leads
    * [ ] Garantir que exportação não bloqueie UI
    * [ ] Implementar criação de job assíncrono de exportação
    * [ ] Vincular job ao eventId


### Metrics 
- [] Deve ser possivel listar os leads com base no periodo do evento
    * [ ] Implementar consulta de leads por janela de tempo
    * [ ] Garantir resposta determinística para o período solicitado
    * [ ] Otimizar para alto volume (pré-agregação)
    * [ ] Garantir latência dentro do limite definido no NFR
- [] Deve ser possivel obter a media de captura de leads por evento
    * [ ] Definir e documentar fórmula de cálculo
    * [ ] Considerar apenas tempo ativo do evento
- [] Deve ser possivel obter um resumo consolidado do evento
    * [ ] Calcular total de leads no período do evento
    * [ ] Calcular leads na hora atual
    * [ ] Calcular status do evento (ativo/encerrado)
- [] Deve ser possivel listar o total de leads agrupados por origem
    * [ ] Retornar contagem total de leads por origem
    * [ ] Adicionar paginação configurável
    * [ ] Suportar filtros por período (data inicial/final)
    * [ ] Ordenar resultados por contagem (descendente)
- [] Deve ser possivel listar o total de leads agrupados por turma de interesse
    * [ ] Retornar contagem total de leads por turma
    * [ ] Adicionar paginação configurável
    * [ ] Suportar filtros por período (data inicial/final)
    * [ ] Ordenar resultados por contagem (descendente)


### Printer
- [] Deve ser possivel Enfileirar solicitações de impressão 
    * [ ] Implementar criação de job de impressão assíncrono
    * [ ] Validar printerId e disponibilidade da impressora
    * [ ] Validar formato do payload
    * [ ] Associar job à impressora correta
- [] Deve ser possivel consultar a fila de impressão por impressora
    * [ ] Implementar listagem de jobs pendentes por printerId
    * [ ] Adicionar paginação configurável
    * [ ] Retornar contagem total de jobs pendentes
- [] Deve ser possivel Priorizar / reordenar a fila de impressão
    * [ ] Implementar reordenação de jobs na fila
    * [ ] Garantir operação atômica
    * [ ] Registrar auditoria da reordenação
    * [ ] Bloquear estados não permitidos
- [] Deve ser possivel verificar o status do Job
    * [ ] Implementar endpoint de consulta de job
    * [ ] Retornar status atual (pending, processing, done, failed)
    * [ ] Retornar histórico de tentativas
    * [ ] Retornar último erro, se existir
- [] Deve ser possivel cancelar ou reprocessar o Job
    * [ ] Implementar reprocessamento manual de job
    * [ ] Implementar cancelamento de job pendente
- [] Dever ser possivel bloquear o envio para impressoras indisponível
    * [ ] Validar status da impressora antes de criar job
    * [ ] Bloquear criação se impressora estiver offline


### JOB
- [] Deve ser possivel fazer o processamento de jobs por um workers
    * [ ] Implementar workers assíncronos
    * [ ] Controlar concorrência por tipo de job
    * [ ] Tornar limite configurável
    * [ ] Expor métricas de sucesso e falha
- [] Deve ser possivel pausar / retormar Jobs
    * [ ] Implementar pausa e retomada de filas
    * [ ] Implementar habilitar/desabilitar tipos de job
    * [ ] Garantir que jobs em processamento não sejam interrompidos
    * [ ] Bloquear novas criações quando aplicável