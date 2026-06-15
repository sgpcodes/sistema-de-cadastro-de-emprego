# Sistema de Gestão de Empregabilidade e Assistência ao Trabalhador

Sistema web completo para centralizar o atendimento ao trabalhador, desde o primeiro contato até a contratação. Desenvolvido como monorepo com arquitetura de microsserviços, Clean Architecture e princípios SOLID.

---

## Sumário

1. [Arquitetura](#arquitetura)
2. [Deploy no Render](#deploy-no-render)
3. [Como Executar](#como-executar)
4. [Módulos Implementados](#módulos-implementados)
5. [Banco de Dados](#banco-de-dados)
6. [Clean Architecture](#clean-architecture)
7. [Princípios SOLID](#princípios-solid)
8. [Design Patterns](#design-patterns)
9. [Testes TDD](#testes-tdd)
10. [BDD Cucumber](#bdd-cucumber)
11. [Stack Técnico](#stack-técnico)
12. [Variáveis de Ambiente](#variáveis-de-ambiente)
13. [Segurança](#segurança)
14. [Endpoints da API](#endpoints-da-api)
15. [Estrutura de Pastas](#estrutura-de-pastas)
16. [Troubleshooting](#troubleshooting)
17. [Próximos Passos](#próximos-passos)
18. [Referências](#referências)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│                     Vite · React Router                  │
└───────┬─────────┬──────────┬──────────┬────────────────-┘
        │         │          │          │          │
        ▼         ▼          ▼          ▼          ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │  Auth    │ │ Workers  │ │Referrals │ │Assistance│ │ Reports  │
  │ :3001    │ │  :3002   │ │  :3003   │ │  :3004   │ │  :3005   │
  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
       └────────────┴────────────┴────────────┴─────────────┘
                                 │
                          ┌──────▼──────┐
                          │  PostgreSQL  │
                          │    :5432     │
                          └─────────────┘
```

| Serviço | Porta local | Responsabilidade |
|---|---|---|
| Frontend (React + Vite) | 5173 | Interface do usuário |
| Auth Service | 3001 | Autenticação JWT, cadastro de usuários |
| Workers Service | 3002 | CRUD de trabalhadores (Clean Architecture) |
| Referrals Service | 3003 | Empresas, vagas e encaminhamentos |
| Assistance Service | 3004 | Registros de atendimento |
| Reports Service | 3005 | Dashboard e relatórios analíticos |
| PostgreSQL | 5432 | Banco de dados compartilhado |

> Todos os serviços compartilham o mesmo PostgreSQL e aplicam suas próprias migrations ao iniciar.

---

## Deploy no Render

### Pré-requisitos

- Conta no [Render.com](https://render.com) (plano gratuito é suficiente)
- Repositório no GitHub conectado ao Render

### Serviços criados pelo render.yaml

O arquivo `render.yaml` declara **7 serviços** automaticamente:

| Nome no Render | Tipo | Origem |
|---|---|---|
| `empregabilidade_db` | PostgreSQL | gerenciado pelo Render |
| `auth-service` | Web Service (Node.js) | `services/auth/` |
| `workers-service` | Web Service (Node.js) | `services/workers/` |
| `referrals-service` | Web Service (Node.js) | `services/referrals/` |
| `assistance-service` | Web Service (Node.js) | `services/assistance/` |
| `reports-service` | Web Service (Node.js) | `services/reports/` |
| `frontend` | Static Site | `apps/frontend/` |

### Passo 1 — Primeiro deploy (Blueprint)

1. Acesse o painel do Render → **New** → **Blueprint**
2. Conecte o repositório GitHub
3. O Render detectará o `render.yaml` automaticamente
4. Preencha as variáveis marcadas como `sync: false` (veja tabela abaixo)
5. Clique em **Apply**

### Passo 2 — Variáveis obrigatórias no primeiro deploy

| Variável | Serviço | Valor |
|---|---|---|
| `JWT_SECRET` | auth-service | string aleatória segura (ex: `openssl rand -base64 32`) |
| `FRONTEND_URL` | todos os backends | deixar em branco por enquanto (preencher depois) |
| `VITE_API_AUTH_URL` | frontend | deixar em branco por enquanto |
| `VITE_API_WORKERS_URL` | frontend | deixar em branco por enquanto |
| `VITE_API_REFERRALS_URL` | frontend | deixar em branco por enquanto |
| `VITE_API_ASSISTANCE_URL` | frontend | deixar em branco por enquanto |
| `VITE_API_REPORTS_URL` | frontend | deixar em branco por enquanto |

> As variáveis `VITE_*` são embutidas no build do frontend. Se deixadas em branco no primeiro deploy, o sistema fará fallback para `localhost` (não funcionará em produção), mas o build concluirá sem erros.

### Passo 3 — Pós-deploy: configurar URLs entre serviços

Após o primeiro deploy, copie as URLs geradas pelo Render (formato `https://nome-do-servico.onrender.com`) e configure:

**Nos backends (Dashboard do Render → cada serviço → Environment):**

| Variável | Valor |
|---|---|
| `FRONTEND_URL` | URL do frontend gerada pelo Render |

**No frontend (Dashboard → frontend → Environment):**

| Variável | Valor |
|---|---|
| `VITE_API_AUTH_URL` | `https://auth-service-xxxx.onrender.com` |
| `VITE_API_WORKERS_URL` | `https://workers-service-xxxx.onrender.com` |
| `VITE_API_REFERRALS_URL` | `https://referrals-service-xxxx.onrender.com` |
| `VITE_API_ASSISTANCE_URL` | `https://assistance-service-xxxx.onrender.com` |
| `VITE_API_REPORTS_URL` | `https://reports-service-xxxx.onrender.com` |

Após salvar, clique em **Manual Deploy** no serviço `frontend` para recompilar com as URLs corretas.

### Banco de dados

O Render cria o PostgreSQL automaticamente via `render.yaml`. As tabelas são criadas pelas migrations embutidas em cada serviço ao iniciar — **não é necessário executar o `init.sql` manualmente**.

Tabelas criadas por serviço:

| Serviço | Tabela criada |
|---|---|
| auth-service | `usuarios` |
| workers-service | `trabalhadores` |
| referrals-service | `empresas`, `vagas`, `encaminhamentos` |
| assistance-service | `atendimentos` |

### Observações sobre o plano gratuito

- Serviços gratuitos entram em **sleep após 15 min de inatividade**. A primeira requisição demora ~30s para acordar.
- O banco PostgreSQL gratuito tem limite de **1 GB** de armazenamento.
- Para demonstração acadêmica, o plano gratuito é suficiente.

---

## Deploy no Railway

### Por que "Missing script: start" acontece

Railway roda `npm start` no diretório configurado para cada serviço. Se o diretório não for configurado corretamente, Railway usa a **raiz do repositório** — e o `package.json` raiz não tem `start`. Isso faz **todos os serviços falharem** mesmo que os serviços individuais estejam corretos.

### Pré-requisitos

- Conta no [Railway.app](https://railway.app)
- Repositório no GitHub conectado ao Railway

### Estado dos scripts `start` por serviço

| Serviço | Arquivo | Script `start` | Arquivo de entrada |
|---|---|---|---|
| Auth | `services/auth/package.json` | `node dist/index.js` | ✅ compilado pelo `tsc` |
| Workers | `services/workers/package.json` | `node dist/index.js` | ✅ compilado pelo `tsc` |
| Referrals | `services/referrals/package.json` | `node dist/index.js` | ✅ compilado pelo `tsc` |
| Assistance | `services/assistance/package.json` | `node dist/index.js` | ✅ compilado pelo `tsc` |
| Reports | `services/reports/package.json` | `node dist/index.js` | ✅ compilado pelo `tsc` |
| Frontend | `apps/frontend/package.json` | `serve -s dist` | ✅ gerado pelo `vite build` |
| **Raiz** | `package.json` | ❌ ausente (não deployar) | — |

### Configuração do Railway (obrigatório para monorepo)

Crie **7 serviços separados** no Railway dentro do mesmo projeto. Para cada serviço, configure o **Root Directory** no painel:

| Serviço Railway | Root Directory | Variáveis necessárias |
|---|---|---|
| `auth-service` | `services/auth` | `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN=24h`, `FRONTEND_URL` |
| `workers-service` | `services/workers` | `DATABASE_URL`, `FRONTEND_URL` |
| `referrals-service` | `services/referrals` | `DATABASE_URL`, `FRONTEND_URL` |
| `assistance-service` | `services/assistance` | `DATABASE_URL`, `FRONTEND_URL` |
| `reports-service` | `services/reports` | `DATABASE_URL`, `FRONTEND_URL` |
| `frontend` | `apps/frontend` | `VITE_API_AUTH_URL`, `VITE_API_WORKERS_URL`, `VITE_API_REFERRALS_URL`, `VITE_API_ASSISTANCE_URL`, `VITE_API_REPORTS_URL` |
| PostgreSQL | — | criado pelo próprio Railway como Add-on |

**Como configurar Root Directory no Railway:**
> Dashboard → Serviço → Settings → Source → Root Directory → digitar o caminho

Com o Root Directory correto, o Railway encontra o `package.json` de cada serviço e usa os scripts `build` e `start` correspondentes. Cada diretório de serviço também contém um `railway.json` com a configuração explícita como fallback.

### Banco de dados no Railway

1. No Railway, adicione um serviço **PostgreSQL** (Add New → Database → PostgreSQL)
2. Railway injeta automaticamente `DATABASE_URL` nos serviços do mesmo projeto via variável de referência:
   ```
   ${{Postgres.DATABASE_URL}}
   ```
3. As tabelas são criadas pelas migrations automáticas de cada serviço no primeiro boot — não é necessário executar SQL manualmente

### Variáveis de ambiente Railway (pós-deploy)

Após os backends subirem, copie as URLs geradas (`https://nome-servico.up.railway.app`) e configure no serviço `frontend`:

| Variável | Valor |
|---|---|
| `VITE_API_AUTH_URL` | URL do auth-service no Railway |
| `VITE_API_WORKERS_URL` | URL do workers-service no Railway |
| `VITE_API_REFERRALS_URL` | URL do referrals-service no Railway |
| `VITE_API_ASSISTANCE_URL` | URL do assistance-service no Railway |
| `VITE_API_REPORTS_URL` | URL do reports-service no Railway |

Depois do deploy do frontend, configure `FRONTEND_URL` em cada backend com a URL gerada para o serviço `frontend`.

### Testar localmente antes de subir

```bash
# Backend — simular produção local (requer PostgreSQL rodando)
cd services/auth && npm install && npm run build && npm start
cd services/workers && npm install && npm run build && npm start

# Frontend — simular produção local
cd apps/frontend && npm install && npm run build && npm start
# acessa http://localhost:3000
```

---

## Como Executar

### Com Docker Compose (recomendado)

```bash
docker-compose up -d
# Frontend disponível em http://localhost:5173
```

### Desenvolvimento local

```bash
npm install
npm run dev
```

---

## Módulos Implementados

### Dashboard Ilustrativo (`/`)
- Exibe indicadores e gráficos demonstrativos
- **Os dados são fictícios** — não refletem registros reais do banco

### Trabalhadores (`/workers`)
- Cadastro: Nome, CPF, Telefone, Cargo desejado, Escolaridade, Experiência profissional
- Edição completa dos dados e status
- Status com indicador visual: **Disponível** (azul) · **Encaminhado** (amarelo) · **Contratado** (verde)
- Visualização de detalhes

### Empresas (`/companies`)
- Cadastro completo: Razão Social, Nome Fantasia, CNPJ, Ramo de Atividade, Porte, Qtd. Funcionários
- Localização: CEP, Endereço, Número, Complemento, Bairro, Cidade, Estado
- Contato: Responsável, Cargo, Telefone, Celular, E-mail, WhatsApp
- Informações adicionais: Site, Benefícios, Horário de funcionamento, Observações
- Status com indicador visual: **Ativa** (verde) · **Inativa** (vermelho) · **Parceira** (azul)
- Detalhes incluem histórico de vagas (total, abertas, preenchidas, canceladas)

### Vagas (`/vacancies`)
- Cadastro vinculado a uma empresa (selecionada via dropdown)
- Campos: Cargo, Salário, Requisitos, Status
- Status com indicador visual: **Aberta** (azul) · **Preenchida** (verde) · **Cancelada** (vermelho)
- Alteração de status via modal dedicado
- Detalhes exibem dados de contato da empresa vinculada

### Assistência (`/assistance`)
- Cadastro de atendimentos de forma independente (sem vínculo obrigatório com trabalhador)
- Dados da pessoa atendida: Nome, CPF, Telefone, Escolaridade, Profissão, Cargo desejado, Experiência
- Informações do atendimento: Tipo, Descrição detalhada
- Tipos disponíveis: Orientação Profissional, Assistência Psicológica, Seguro-Desemprego, Informações e Cadastros, Outros
- Data e hora registradas automaticamente

---

## Banco de Dados

### Tabelas

| Tabela | Descrição |
|---|---|
| `usuarios` | Usuários do sistema (autenticação) |
| `trabalhadores` | Dados e status dos trabalhadores |
| `empresas` | Cadastro completo de empresas parceiras |
| `vagas` | Vagas vinculadas às empresas |
| `encaminhamentos` | Registro de encaminhamentos (trabalhador → vaga) |
| `seguros_desemprego` | Histórico de seguros-desemprego |
| `atendimentos` | Atendimentos de assistência (standalone) |

### Migrations automáticas

Cada serviço aplica suas migrations antes de iniciar. Isso garante que volumes Docker com schema antigo sejam atualizados automaticamente sem necessidade de recriar o volume.

### Credenciais padrão (Docker)

```
Host:     localhost:5432
Database: empregabilidade_db
User:     empregabilidade
Password: senha_segura_123
```

---

## Clean Architecture

Implementada em **Auth Service** e **Workers Service**:

```
src/
├── domain/
│   ├── entities/        # Ex: Worker.ts, Usuario.ts
│   ├── repositories/    # Ex: IWorkerRepository.ts (interface)
│   └── factories/       # Ex: WorkerFactory.ts (Factory Pattern)
├── application/
│   ├── useCases/        # Ex: CreateWorkerUseCase.ts, LoginUseCase.ts
│   └── strategies/      # Ex: FilterByStatusStrategy.ts (Strategy Pattern)
├── infrastructure/
│   ├── database/        # DatabaseConnection.ts (wrapper do Pool)
│   └── repositories/    # Ex: WorkerRepository.ts (implementação concreta)
├── presentation/
│   ├── controllers/     # Ex: WorkerController.ts
│   └── routes/          # Ex: workerRoutes.ts
└── index.ts             # Composição de dependências (DI manual)
```

Cada camada depende apenas das camadas internas. O `index.ts` é o único ponto que faz o wiring manual das dependências:

```typescript
const db = new DatabaseConnection(DATABASE_URL);
const workerRepository = new WorkerRepository(db);
const createWorkerUseCase = new CreateWorkerUseCase(workerRepository);
const workerController = new WorkerController(createWorkerUseCase, ...);
app.use('/workers', createWorkerRoutes(workerController));
```

---

## Princípios SOLID

| Princípio | Implementação no código |
|---|---|
| **S** — Single Responsibility | `WorkerController` só lida com HTTP; `CreateWorkerUseCase` só cria; `WorkerRepository` só persiste |
| **O** — Open/Closed | Novos filtros via `IWorkerFilterStrategy` sem alterar `GetWorkersUseCase` |
| **L** — Liskov Substitution | `WorkerRepository` substitui `IWorkerRepository` sem quebrar contratos |
| **I** — Interface Segregation | `IWorkerRepository` expõe só o que o domínio precisa |
| **D** — Dependency Inversion | `CreateWorkerUseCase` recebe `IWorkerRepository` (abstração), não `WorkerRepository` (concreção) |

---

## Design Patterns

| Padrão | Localização | Descrição |
|---|---|---|
| **Repository Pattern** | `IWorkerRepository` / `WorkerRepository` | Abstrai o acesso ao banco de dados; use cases nunca tocam SQL diretamente |
| **Factory Pattern** | `WorkerFactory` | Centraliza criação de entidades `Worker` com validação e defaults — `create()` e `createFromDbRow()` |
| **Strategy Pattern** | `FilterByStatusStrategy`, `FilterByNameStrategy` | Algoritmos de filtro intercambiáveis — `GetWorkersUseCase` recebe qualquer `IWorkerFilterStrategy` |
| **Dependency Injection** | `index.ts` dos serviços auth e workers | Composição manual — use cases recebem repositórios via construtor, sem acoplamento a implementações |

### Exemplo — Strategy Pattern em uso

```typescript
// WorkerController seleciona a estratégia com base em query params
if (req.query.status) {
  filterStrategy = new FilterByStatusStrategy(req.query.status as WorkerStatus);
} else if (req.query.nome) {
  filterStrategy = new FilterByNameStrategy(req.query.nome as string);
}
const workers = await this.getWorkersUseCase.execute(filterStrategy);
```

---

## Testes TDD

Testes escritos antes da implementação. **26 testes unitários**, todos passando.

### Auth Service — `services/auth/src/application/useCases/__tests__/`

| Arquivo | Casos |
|---|---|
| `LoginUseCase.test.ts` | Login OK · Usuário não encontrado · Senha incorreta · Usuário inativo |
| `SignupUseCase.test.ts` | Signup OK · Email duplicado |

### Workers Service — `services/workers/src/`

| Arquivo | Casos |
|---|---|
| `application/useCases/__tests__/CreateWorkerUseCase.test.ts` | Criar OK · Nome obrigatório · CPF obrigatório · Normalização de CPF · Status padrão ATIVO |
| `application/useCases/__tests__/UpdateWorkerUseCase.test.ts` | Atualizar OK · ID não encontrado lança erro · Atualizar para CONTRATADO |
| `application/useCases/__tests__/GetWorkersUseCase.test.ts` | Sem filtro · FilterByStatus · FilterByName · Lista vazia |
| `__tests__/workers.test.ts` | WorkerFactory.create (4 casos) · FilterByStatusStrategy · FilterByNameStrategy · Combinação de filtros |

### Rodar testes

```bash
# Por serviço
cd services/workers && npm test
cd services/auth && npm test

# Via root (scripts configurados)
npm run test:workers
npm run test:auth
```

---

## BDD Cucumber

Comportamentos documentados em Gherkin e verificados contra a API real.

### Features — `features/`

| Feature | Cenários |
|---|---|
| `autenticacao.feature` | Login válido · Login com credenciais inválidas · Logout |
| `cadastro_trabalhador.feature` | Cadastro com sucesso · CPF duplicado · Validação de campos obrigatórios |
| `encaminhamento.feature` | Registro de encaminhamento · Atualizar status para ENCAMINHADO |
| `contratacao.feature` | Contratação bem-sucedida · Consultar trabalhadores contratados |
| `seguro_desemprego.feature` | Registro de atendimento SEGURO_DESEMPREGO · Listar atendimentos |

### Step Definitions — `features/step_definitions/`

- `autenticacao.steps.ts`
- `cadastro_trabalhador.steps.ts`
- `encaminhamento_contratacao_seguro.steps.ts`

### Rodar BDD (requer serviços rodando)

```bash
docker-compose up -d
npm run test:bdd
```

---

## Stack Técnico

**Frontend:** React 18 · TypeScript · Vite · React Router · Axios · Zustand

**Backend:** Node.js 18 · Express.js · TypeScript · pg (node-postgres) · jsonwebtoken · bcrypt

**Banco:** PostgreSQL 15

**Testes:** Jest · ts-jest · Supertest · @cucumber/cucumber

**Infra:** Docker · Docker Compose · GitHub Actions (CI/CD) · Vercel (frontend) · Render/Railway (backend)

---

## Variáveis de Ambiente

### Backend (todos os serviços)

| Variável | Descrição | Padrão dev |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://...@postgres:5432/empregabilidade_db` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `PORT` | Porta do serviço | varia por serviço |
| `FRONTEND_URL` | URL do frontend (para CORS em produção) | não definido (permite todas as origens) |

### Auth Service (adicional)

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave secreta para assinar tokens JWT |
| `JWT_EXPIRES_IN` | Tempo de expiração do token (padrão: `24h`) |

### Frontend (variáveis Vite, embutidas no build)

| Variável | Padrão local |
|---|---|
| `VITE_API_AUTH_URL` | `http://localhost:3001` |
| `VITE_API_WORKERS_URL` | `http://localhost:3002` |
| `VITE_API_REFERRALS_URL` | `http://localhost:3003` |
| `VITE_API_ASSISTANCE_URL` | `http://localhost:3004` |
| `VITE_API_REPORTS_URL` | `http://localhost:3005` |

### Arquivo .env para desenvolvimento local

```env
DATABASE_URL=postgresql://empregabilidade:senha_segura_123@postgres:5432/empregabilidade_db
JWT_SECRET=sua_chave_secreta_local
PORT=3001
NODE_ENV=development
```

---

## Segurança

- Senhas com bcrypt (salt rounds: 10)
- JWT tokens com expiração de 24h
- CORS configurado por serviço
- Validação de entrada nos endpoints
- Autenticação obrigatória em rotas protegidas

---

## Endpoints da API

### Auth Service (`:3001`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticação, retorna JWT |
| POST | `/auth/signup` | Criação de conta |

### Workers Service (`:3002`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/workers` | Criar trabalhador |
| GET | `/workers` | Listar (suporta `?status=` e `?nome=`) |
| GET | `/workers/:id` | Detalhar trabalhador |
| PUT | `/workers/:id` | Atualizar dados/status |
| DELETE | `/workers/:id` | Remover trabalhador |

### Referrals Service (`:3003`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/companies` | Listar empresas com contagem de vagas |
| GET | `/companies/:id` | Detalhar empresa com lista de vagas |
| POST | `/companies` | Criar empresa |
| PUT | `/companies/:id` | Atualizar empresa |
| DELETE | `/companies/:id` | Remover empresa |
| GET | `/vacancies` | Listar vagas (com dados da empresa via JOIN) |
| POST | `/vacancies` | Criar vaga (`empresa_id` obrigatório) |
| PUT | `/vacancies/:id` | Atualizar vaga/status |
| DELETE | `/vacancies/:id` | Remover vaga |

### Assistance Service (`:3004`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/assistance` | Registrar atendimento |
| GET | `/assistance` | Listar atendimentos |
| GET | `/assistance/:id` | Detalhar atendimento |
| PUT | `/assistance/:id` | Atualizar atendimento |
| DELETE | `/assistance/:id` | Remover atendimento |

---

## Estrutura de Pastas

```
├── apps/
│   └── frontend/src/
│       ├── pages/           # CompaniesPage, WorkersPage, VacanciesPage, AssistancePage, DashboardPage
│       ├── components/      # Button, Input, Modal, Table, Toast, Sidebar, Card...
│       └── api/apiClient.ts # Instâncias Axios por serviço
├── services/
│   ├── auth/src/
│   │   ├── domain/          # entities, repositories (interfaces), factories
│   │   ├── application/     # useCases, strategies
│   │   ├── infrastructure/  # DatabaseConnection, repositórios concretos
│   │   └── presentation/    # controllers, routes
│   ├── workers/src/         # mesma estrutura Clean Architecture
│   ├── referrals/src/index.ts  # Empresas + Vagas
│   ├── assistance/src/index.ts
│   └── shared/database/init.sql
├── features/
│   ├── *.feature            # Especificações BDD em Gherkin
│   ├── step_definitions/    # Implementações TypeScript dos steps
│   └── support/world.ts     # CustomWorld (contexto de cenário)
├── docker-compose.yml
├── cucumber.json
└── package.json
```

---

## Troubleshooting

**Serviço não conecta ao banco:**
```bash
docker-compose logs postgres
docker ps
```

**Porta já em uso:**
```bash
# Linux/Mac
lsof -i :5173
# Windows
netstat -ano | findstr :5173
```

**Reiniciar um serviço após alteração de código:**
```bash
docker-compose restart referrals-service
docker-compose restart assistance-service
```

**Recriar containers do zero (perde dados):**
```bash
docker-compose down -v
docker-compose up -d
```

**Testes falhando:**
```bash
npm run test:workers -- --watch
# ou arquivo específico
cd services/workers && npx jest src/application/useCases/__tests__/CreateWorkerUseCase.test.ts
```

---

## Próximos Passos

1. Implementar validações mais robustas (CPF, CNPJ, e-mail)
2. Adicionar paginação em listas
3. Implementar filtros avançados por status, cidade, data
4. Adicionar upload de arquivos (currículos)
5. Dashboard com dados reais do banco (substituir o ilustrativo)
6. Implementar relatórios em PDF
7. Mobile app (React Native)

---

## Referências

- [Clean Architecture — Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Versão**: 1.2.0 · **Última atualização**: 2026-06-11 · Projeto acadêmico integrador
