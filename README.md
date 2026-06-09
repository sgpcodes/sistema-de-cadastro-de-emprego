# Sistema de Gestão de Empregabilidade e Assistência ao Trabalhador

Sistema web completo para centralizar o atendimento ao trabalhador, desde o primeiro atendimento até sua possível contratação.

## 🏗️ Arquitetura

Projeto organizado como monorepo com microsserviços:

- **Frontend**: React + Vite + Router + Axios
- **Auth Service**: Autenticação com JWT
- **Workers Service**: CRUD de trabalhadores
- **Referrals Service**: Vagas e encaminhamentos
- **Assistance Service**: Seguro-desemprego e assistência
- **Reports Service**: Dashboard e indicadores
- **Database**: PostgreSQL

## 🚀 Instalação e Setup

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

### Com Docker Compose

```bash
# Clone ou extraia o projeto
cd sistema-de-cadastro-de-emprego

# Inicie todos os serviços
docker-compose up -d

# Aguarde alguns segundos para o banco de dados inicializar
# A aplicação estará disponível em http://localhost:5173
```

### Desenvolvimento Local

```bash
# Instale as dependências de todos os workspaces
npm install

# Inicie todos os serviços em paralelo
npm run dev

# Ou inicie cada serviço separadamente:
cd apps/frontend && npm run dev
cd services/auth && npm run dev
cd services/workers && npm run dev
# ... etc
```

## 📋 Funcionalidades

### Autenticação
- Login
- Cadastro
- JWT Token
- Controle de perfil

### Trabalhadores
- Cadastro (CPF, Nome, Telefone, Email, Escolaridade, Profissão, Experiência)
- Consulta
- Atualização
- Status (ATIVO, ENCAMINHADO, CONTRATADO, INATIVO)

### Vagas
- Cadastro de empresas
- Cadastro de vagas
- Status (ABERTA, PREENCHIDA, CANCELADA)

### Encaminhamentos
- Encaminhar trabalhador para vaga
- Acompanhar status
- Status (PENDENTE, ACEITO, REJEITADO, CONTRATADO)

### Assistência
- Seguro-desemprego
- Atendimento psicológico
- Orientação profissional
- Ajuda com currículo

### Dashboard
- Indicadores de empregabilidade
- Estatísticas
- Taxa de contratação

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Cobertura de testes (meta: 80%)
npm run test:coverage
```

## 📊 Cenários BDD

### Funcionalidade: Encaminhar Trabalhador
```
Dado que existe um trabalhador cadastrado
E existe uma vaga disponível
Quando o atendente realizar o encaminhamento
Então o sistema deve registrar o encaminhamento
E atualizar o status do trabalhador
```

### Funcionalidade: Registrar Contratação
```
Dado que existe um trabalhador encaminhado
Quando a empresa informar a contratação
Então o sistema deve atualizar o status para contratado
```

## 🛠️ Stack Técnico

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Testing**: Jest, Supertest, Cucumber
- **Containerização**: Docker, Docker Compose
- **Padrões**: Clean Architecture, SOLID, Design Patterns
- **Deploy**: Vercel (Frontend), Render/Railway (Backend)

## 📁 Estrutura do Projeto

```
├── apps/
│   └── frontend/
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── store/
│       │   ├── api/
│       │   └── main.tsx
│       └── package.json
├── services/
│   ├── auth/
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── workers/
│   ├── referrals/
│   ├── assistance/
│   └── reports/
├── shared/
│   └── database/
│       └── init.sql
├── docker-compose.yml
└── package.json
```

## 🌐 URLs dos Serviços

- **Frontend**: http://localhost:5173
- **Auth Service**: http://localhost:3001
- **Workers Service**: http://localhost:3002
- **Referrals Service**: http://localhost:3003
- **Assistance Service**: http://localhost:3004
- **Reports Service**: http://localhost:3005
- **Database**: localhost:5432

## 📝 Credenciais Padrão

### Database
- User: `empregabilidade`
- Password: `senha_segura_123`
- Database: `empregabilidade_db`

## 🚢 Deploy

### Frontend (Vercel)
```bash
# Buildar para produção
npm run build

# Deploy automático via Git
```

### Backend (Render/Railway)
```bash
# Configure as variáveis de ambiente
# Faça deploy via Git ou CLI
```

## 📖 Documentação Adicional

- Clean Architecture implementada em cada microsserviço
- Princípios SOLID aplicados
- Design Patterns: Repository, Factory, Strategy, Dependency Injection, Observer
- TDD com cobertura mínima de 80%

## 📞 Suporte

Para dúvidas ou problemas, verifique os logs:
```bash
docker-compose logs -f [service-name]
```

## 📄 Licença

Este projeto é parte de um projeto acadêmico integrador.
