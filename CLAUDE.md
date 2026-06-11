# Sistema de Gestão de Empregabilidade

Documentação completa do projeto: ver [README.md](./README.md).

## Contexto rápido para o Claude

- Monorepo com microsserviços Node.js/Express + React frontend
- Auth (3001) · Workers (3002) · Referrals (3003) · Assistance (3004) · Frontend (5173)
- Workers e Auth usam Clean Architecture completa (domain/application/infrastructure/presentation)
- Design Patterns implementados: Repository, Factory (`WorkerFactory`), Strategy (`FilterByStatusStrategy`, `FilterByNameStrategy`), Dependency Injection
- 26 testes unitários em `services/workers` e `services/auth` — rodar com `npm run test:workers` / `npm run test:auth`
- BDD com Cucumber em `features/` — rodar com `docker-compose up -d && npm run test:bdd`
- Migrations automáticas: cada serviço migra o banco antes de iniciar (não recriar volume ao adicionar colunas)
- Banco Docker: `empregabilidade_db` / user `empregabilidade` / senha `senha_segura_123`

## Convenções

- TypeScript em todo o projeto
- Novos endpoints no Referrals/Assistance: adicionar migration no array do `runMigrations()` em `services/<serviço>/src/index.ts`
- Novos filtros de Workers: criar nova classe implementando `IWorkerFilterStrategy`, sem alterar `GetWorkersUseCase`
- Testes: escrever antes da implementação (TDD), manter cobertura 80%+
- Novas funcionalidades: criar feature BDD em `features/` com step definitions correspondentes
