# Sistema de Gestão de Empregabilidade - Documentação de Projeto

## 📋 Visão Geral

Sistema web completo para centralizar o atendimento ao trabalhador, desde o primeiro atendimento até sua possível contratação. Implementado como arquitetura de microsserviços com Clean Architecture e princípios SOLID.

## 🏗️ Arquitetura do Projeto

### Microsserviços
- **Auth Service** (port 3001): Autenticação com JWT
- **Workers Service** (port 3002): CRUD de trabalhadores
- **Referrals Service** (port 3003): Vagas e encaminhamentos
- **Assistance Service** (port 3004): Seguro-desemprego e assistência
- **Reports Service** (port 3005): Dashboard e indicadores
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

### Clean Architecture em cada serviço
```
src/
├── domain/
│   ├── entities/        # Entidades de negócio
│   └── repositories/    # Interfaces de repositório
├── application/
│   ├── useCases/        # Casos de uso
│   └── services/        # Serviços de aplicação
├── infrastructure/
│   ├── database/        # Configuração DB
│   └── repositories/    # Implementação de repositório
├── presentation/
│   ├── controllers/     # Controllers
│   ├── routes/          # Definição de rotas
│   └── middlewares/     # Middlewares
└── index.ts             # Inicialização do servidor
```

### SOLID Principles
- **S**: Cada classe tem responsabilidade única (Repository, Service, Controller)
- **O**: Novo tipo de assistência sem modificar código existente
- **L**: Substituição de abstrações sem quebra
- **I**: Interfaces específicas por contexto
- **D**: Dependência em abstrações, não em implementações

### Design Patterns
- Repository Pattern (Data access layer)
- Factory Pattern (Criação de entidades)
- Strategy Pattern (Tipos de atendimento)
- Dependency Injection (Controllers e Services)
- Observer Pattern (Notificações)

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

### Cobertura Esperada: 80%+

### TDD (Test-Driven Development)
Testes escritos **antes** da implementação

### Casos Mínimos:
1. Login e Signup
2. Cadastro de trabalhador
3. Cadastro de vaga
4. Encaminhamento
5. Contratação
6. Seguro-desemprego

### BDD (Cucumber)
Features em `features/` diretório:
- `autenticacao.feature`
- `cadastro_trabalhador.feature`
- `encaminhamento.feature`
- `contratacao.feature`
- `seguro_desemprego.feature`

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
- ✅ Login
- ✅ Signup
- ✅ JWT geração/validação
- ✅ Controle de perfil

### Workers Service
- ✅ Create: POST /workers
- ✅ Read: GET /workers, GET /workers/:id
- ✅ Update: PUT /workers/:id
- ✅ Delete: DELETE /workers/:id

### Referrals Service
- ✅ Vagas: CREATE, READ, UPDATE
- ✅ Encaminhamentos: CREATE, READ, UPDATE status

### Assistance Service
- ✅ Seguro-desemprego: CREATE, READ
- ✅ Atendimentos: CREATE, READ

### Reports Service
- ✅ Dashboard com indicadores
- ✅ Taxa de empregabilidade
- ✅ Estatísticas por status

## 🎯 Próximos Passos

1. Implementar validações mais robustas
2. Adicionar paginação em listas
3. Implementar filtros avançados
4. Adicionar upload de arquivos (currículos)
5. Integrar com serviço de notificações (email/SMS)
6. Implementar relatórios em PDF
7. Dashboard com gráficos
8. Mobile app (React Native)

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

**Última atualização**: 2026-06-05
**Versão**: 1.0.0
