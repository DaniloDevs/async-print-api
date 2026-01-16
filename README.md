# Async Print API

Uma API assíncrona robusta para gerenciamento de eventos e leads com integração de impressoras térmicas. Sistema completo para captura, organização e exportação de dados de participantes de eventos.

## 📋 Visão Geral

A Async Print API é uma aplicação Node.js/TypeScript que fornece:
- **Gerenciamento de Eventos**: Criar, atualizar e gerenciar eventos
- **Registro de Leads**: Capturar e armazenar dados de participantes
- **Exportação de Dados**: Exportar leads em múltiplos formatos
- **Integração de Impressoras**: Detectar e configurar dispositivos de impressão térmica
- **Fila Assíncrona**: Processamento assíncrono de tarefas via BullMQ
- **API Interativa**: Documentação Swagger integrada

## 🚀 Tecnologias

- **Runtime**: Node.js com TypeScript
- **Framework**: Fastify (servidor HTTP)
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Fila de Tarefas**: BullMQ + Bull Board Dashboard
- **Armazenamento**: MinIO (S3 compatible)
- **Impressão**: node-thermal-printer
- **Validação**: Zod
- **Testes**: Vitest


## 📚 Estrutura do Projeto

```
src/
├── routes/              # Endpoints da API
│   ├── events/          # Rotas de eventos
│   ├── metrics/         # Rotas de métricas
│   └── printer/         # Rotas de impressora
├── service/             # Lógica de negócio
├── repository/          # Acesso a dados
├── provider/            # Provedores externos (MinIO)
├── connections/         # Configurações de conexão
├── jobs/                # Workers assíncrona
├── utils/               # Utilitários
├── _errors/             # Erros customizados
└── env/                 # Configuração de variáveis
```


## 📄 Licença

Este projeto está licenciado sob a Licença ISC - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ 

## 🆘 Suporte

Para questões ou sugestões, abra uma issue no repositório ou entre em contato.
