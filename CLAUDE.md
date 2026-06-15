# Sistema de Gestão de Empregabilidade

Documentação completa do projeto: ver [README.md](./README.md).

## Contexto rápido para o Claude

### Estrutura geral
- Monorepo com microsserviços Node.js/Express + React frontend
- Auth (3001) · Workers (3002) · Referrals (3003) · Assistance (3004) · Reports (3005) · Frontend (5173)
- Workers e Auth usam Clean Architecture completa (domain/application/infrastructure/presentation)
- Os demais serviços (Referrals, Assistance, Reports) são mais simples: lógica direta em `src/index.ts`

### Design Patterns implementados
- Repository Pattern: `IWorkerRepository` / `WorkerRepository`
- Factory Pattern: `WorkerFactory` em `services/workers/src/domain/factories/`
- Strategy Pattern: `FilterByStatusStrategy`, `FilterByNameStrategy` em `services/workers/src/application/strategies/`
- Dependency Injection: wiring manual em `services/workers/src/index.ts` e `services/auth/src/index.ts`

### Testes
- 26 testes unitários em `services/workers` e `services/auth`
- Rodar: `npm run test:workers` / `npm run test:auth`
- BDD com Cucumber em `features/` — rodar com `docker-compose up -d && npm run test:bdd`

### Banco de dados
- **Local (Docker):** `empregabilidade_db` / user `empregabilidade` / senha `senha_segura_123`
- **Produção:** Supabase PostgreSQL via Session Pooler (IPv4-compatível — obrigatório no Render free tier)
- Migrations automáticas: cada serviço cria suas tabelas ao iniciar via `runMigrations()` em `src/index.ts`
- Não recriar volume Docker ao adicionar colunas — as migrations usam `IF NOT EXISTS` / `IF NOT EXISTS ADD COLUMN`

### Deploy atual (produção)
- **Frontend:** Vercel — deploy automático a cada push no `main`, configurado via `apps/frontend/vercel.json`
- **Backends:** Render free tier — declarados via `render.yaml`, buildCommand usa `npm install --include=dev` para não pular devDependencies com `NODE_ENV=production`
- **Banco:** Supabase — usar a URL do **Session Pooler** (não a Direct Connection, que é IPv6-only)

### Frontend — CSS responsivo
- Arquivo único: `apps/frontend/src/index.css`
- Breakpoints: `max-width: 1120px` (sidebar icon-only) e `max-width: 760px` (mobile completo)
- No mobile: sidebar vira barra inferior fixa, tabelas viram cartões (`.table-scroll td` com `data-label`), formulários em coluna única
- Classes de detalhe reutilizáveis: `.detail-grid`, `.detail-row`, `.detail-label`, `.detail-value`

## Convenções

- TypeScript em todo o projeto
- Novos endpoints no Referrals/Assistance: adicionar migration no array do `runMigrations()` em `services/<serviço>/src/index.ts`
- Novos filtros de Workers: criar nova classe implementando `IWorkerFilterStrategy`, sem alterar `GetWorkersUseCase`
- Testes: escrever antes da implementação (TDD), manter cobertura 80%+
- Novas funcionalidades: criar feature BDD em `features/` com step definitions correspondentes
- Não commitar arquivos `.env` com credenciais reais — usar `.env.example` como referência
