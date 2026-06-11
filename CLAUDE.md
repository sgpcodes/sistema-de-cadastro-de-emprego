# Sistema de Gestão de Empregabilidade - Documentação de Projeto

## 📋 Visão Geral

Sistema web completo para centralizar o atendimento ao trabalhador, desde o primeiro atendimento até sua possível contratação. Implementado como arquitetura de microsserviços com Clean Architecture e princípios SOLID.

## 🏗️ Arquitetura do Projeto

### Microsserviços
- **Auth Service** (port 3001): Autenticação com JWT
- **Workers Service** (port 3002): CRUD de trabalhadores
- **Referrals Service** (port 3003): Empresas e vagas (empresas com CRUD completo, vagas vinculadas a empresa_id)
- **Assistance Service** (port 3004): Atendimentos standalone (sem FK obrigatória a trabalhadores)
- **Reports Service** (port 3005): Presente na estrutura, não utilizado pela interface atual
- **Frontend** (port 5173): React + Vite
- **Database** (port 5432): PostgreSQL

### Estrutura de Pastas
```
├── apps/frontend/          # React + Vite
├── services/
│   ├── auth/              # Clean Architecture
│   ├── workers/
│   ├── referrals/
│   ├── assistance/
│   └── reports/
├── services/shared/       # Arquivos compartilhados (DB schema)
├── features/              # BDD Cucumber features
└── docker-compose.yml     # Orquestração de containers
```

## 🔧 Stack Técnico

**Frontend:**
- React 18
- TypeScript
- Vite
- React Router
- Axios
- Zustand (state management)

**Backend:**
- Node.js 18
- Express.js
- TypeScript
- PostgreSQL
- jsonwebtoken
- bcrypt

**Testing:**
- Jest (unit & integration)
- Supertest (API testing)
- Cucumber (BDD)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Vercel (Frontend Deploy)
- Render/Railway (Backend Deploy)

## 📐 Padrões de Arquitetura

### Clean Architecture — implementada em Auth Service e Workers Service

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

### SOLID Principles — evidências no código

| Princípio | Implementação |
|---|---|
| **S** — Single Responsibility | `WorkerController` só lida com HTTP; `CreateWorkerUseCase` só cria; `WorkerRepository` só persiste |
| **O** — Open/Closed | Novos filtros via `IWorkerFilterStrategy` sem alterar `GetWorkersUseCase` |
| **L** — Liskov Substitution | `WorkerRepository` substitui `IWorkerRepository` sem quebrar contratos |
| **I** — Interface Segregation | `IWorkerRepository` expõe só o que o domínio precisa |
| **D** — Dependency Inversion | `CreateWorkerUseCase` recebe `IWorkerRepository` (abstração), não `WorkerRepository` (concreção) |

### Design Patterns — implementados no código

| Padrão | Localização | Descrição |
|---|---|---|
| **Repository Pattern** | `IWorkerRepository` / `WorkerRepository` | Abstrai o acesso ao banco de dados |
| **Factory Pattern** | `WorkerFactory` | Centraliza criação de entidades Worker com validação e defaults |
| **Strategy Pattern** | `FilterByStatusStrategy`, `FilterByNameStrategy` | Algoritmos de filtro intercambiáveis sem alterar o use case |
| **Dependency Injection** | `index.ts` de auth e workers | Composição manual — use cases recebem repositórios via construtor |

## 🗄️ Database Schema

Entidades principais:
- `usuarios`: Usuários do sistema (autenticação)
- `trabalhadores`: Dados dos trabalhadores
- `empresas`: Dados das empresas
- `vagas`: Vagas disponíveis
- `encaminhamentos`: Registros de encaminhamentos
- `seguros_desemprego`: Histórico de seguros
- `atendimentos`: Registros de assistência

## 🧪 Testes

### Testes Unitários (TDD) — 20 testes, todos passando

**Auth Service** (`services/auth/src/application/useCases/__tests__/`):
- `LoginUseCase.test.ts` — 4 casos: login OK, usuário não encontrado, senha errada, usuário inativo
- `SignupUseCase.test.ts` — 2 casos: signup OK, email duplicado

**Workers Service** (`services/workers/src/`):
- `application/useCases/__tests__/CreateWorkerUseCase.test.ts` — 5 casos
- `application/useCases/__tests__/UpdateWorkerUseCase.test.ts` — 3 casos
- `application/useCases/__tests__/GetWorkersUseCase.test.ts` — 4 casos (inclui testes do Strategy Pattern)
- `__tests__/workers.test.ts` — 8 casos (Factory Pattern + Filter Strategies)

**Rodar testes:**
```bash
cd services/workers && npm test
cd services/auth && npm test
# ou no root:
npm run test:workers
npm run test:auth
```

### BDD (Cucumber) — Cenários de comportamento

**Features** (`features/`):
- `autenticacao.feature` + `features/step_definitions/autenticacao.steps.ts`
- `cadastro_trabalhador.feature` + `features/step_definitions/cadastro_trabalhador.steps.ts`
- `encaminhamento.feature`, `contratacao.feature`, `seguro_desemprego.feature`

**Rodar BDD** (requer serviços rodando via Docker):
```bash
docker-compose up -d
npm run test:bdd
```

## 🚀 Como Executar

### Com Docker (Recomendado)
```bash
docker-compose up -d
# Frontend: http://localhost:5173
# Banco: localhost:5432
```

### Em Desenvolvimento
```bash
npm install
npm run dev
```

## 📝 Variáveis de Ambiente

Cada serviço tem `.env` configurado. Em produção, usar:
- `JWT_SECRET`: Chave secreta para tokens
- `DATABASE_URL`: Connection string do PostgreSQL
- `NODE_ENV`: development/production

## 🔐 Segurança

- Senhas com bcrypt (salt rounds: 10)
- JWT tokens com expiração de 24h
- CORS configurado
- Validação de entrada em endpoints
- Autenticação em routes protegidas

## 📊 Funcionalidades por Serviço

### Auth Service
- ✅ Login, Signup, JWT, Controle de perfil

### Workers Service
- ✅ POST /workers, GET /workers, GET /workers/:id, PUT /workers/:id, DELETE /workers/:id
- ✅ Campos: nome, cpf, telefone, escolaridade, profissao, experiencia, status
- ✅ Status: ATIVO (Disponível), ENCAMINHADO, CONTRATADO, INATIVO

### Referrals Service
- ✅ GET /companies, GET /companies/:id (com vagas), POST /companies, PUT /companies/:id, DELETE /companies/:id
- ✅ Empresas com CNPJ, localização completa, contato, benefícios, status (ATIVA/INATIVA/PARCEIRA)
- ✅ GET /vacancies, POST /vacancies (aceita empresa_id ou nome empresa), PUT /vacancies/:id, DELETE /vacancies/:id
- ✅ Status vagas: ABERTA, PREENCHIDA, CANCELADA
- ✅ GET /vacancies retorna campos empresa_* via JOIN

### Assistance Service
- ✅ POST /assistance, GET /assistance, GET /assistance/:id, PUT /assistance/:id, DELETE /assistance/:id
- ✅ Atendimentos standalone: nome_atendido, cpf_atendido, telefone_atendido, escolaridade, profissao, experiencia, cargo_desejado, tipo, descricao
- ✅ Tipos: ORIENTACAO_PROFISSIONAL, ASSISTENCIA_PSICOLOGICA, SEGURO_DESEMPREGO, INFORMACOES_CADASTROS, OUTROS

### Reports Service
- ⚠️ Container existe, sem endpoints ativos consumidos pela interface

## 🎯 Próximos Passos

1. Implementar validações mais robustas (CPF, CNPJ, e-mail)
2. Adicionar paginação em listas
3. Implementar filtros avançados por status, cidade, data
4. Adicionar upload de arquivos (currículos)
5. Dashboard com dados reais do banco (substituir o ilustrativo)
6. Implementar relatórios em PDF
7. Mobile app (React Native)

## 🔗 URLs Importantes

- Frontend: http://localhost:5173
- API Auth: http://localhost:3001
- API Workers: http://localhost:3002
- API Referrals: http://localhost:3003
- API Assistance: http://localhost:3004
- API Reports: http://localhost:3005
- Database: localhost:5432

## 📚 Referências

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🛠️ Troubleshooting

### Erro de conexão com banco de dados
```bash
docker-compose logs postgres
# Verificar se o container está running
docker ps
```

### Porto já em uso
```bash
# Mude a porta no docker-compose.yml ou nos .env
lsof -i :5173  # Verificar qual processo usa a porta
```

### Testes falhando
```bash
npm test -- --watch
# ou rodar para arquivo específico
npm test -- services/auth/src/application/useCases/__tests__/LoginUseCase.test.ts
```

## 👥 Contribuições

Para adicionar novas funcionalidades:
1. Crie uma feature BDD em `features/`
2. Implemente em Clean Architecture
3. Escreva testes primeiro (TDD)
4. Mantenha cobertura 80%+
5. Siga SOLID e Design Patterns

---

**Última atualização**: 2026-06-10
**Versão**: 1.1.0
