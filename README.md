# Sistema de Gestão de Empregabilidade e Assistência ao Trabalhador

Sistema web completo para centralizar o atendimento ao trabalhador, desde o primeiro contato até a contratação. Desenvolvido como monorepo com arquitetura de microsserviços, Clean Architecture e princípios SOLID.

## 🏗️ Arquitetura

| Serviço | Porta | Responsabilidade |
|---|---|---|
| Frontend (React + Vite) | 5173 | Interface do usuário |
| Auth Service | 3001 | Autenticação JWT |
| Workers Service | 3002 | CRUD de trabalhadores |
| Referrals Service | 3003 | Empresas e vagas |
| Assistance Service | 3004 | Registros de atendimento |
| PostgreSQL | 5432 | Banco de dados |

> O Reports Service (porta 3005) está presente na estrutura mas não é utilizado pela interface atual.

## 🚀 Como Executar

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

## 📋 Módulos Implementados

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

## 🗄️ Banco de Dados

### Tabelas

| Tabela | Descrição |
|---|---|
| `trabalhadores` | Dados e status dos trabalhadores |
| `empresas` | Cadastro completo de empresas parceiras |
| `vagas` | Vagas vinculadas às empresas |
| `encaminhamentos` | Registro de encaminhamentos (trabalhador → vaga) |
| `atendimentos` | Atendimentos de assistência (standalone) |

### Migrations automáticas
Cada serviço aplica suas migrations antes de iniciar. Isso garante que volumes Docker com schema antigo sejam atualizados automaticamente sem necessidade de recriar o volume.

## 🔧 Stack Técnico

**Frontend:** React 18 · TypeScript · Vite · React Router · Axios  
**Backend:** Node.js 18 · Express.js · TypeScript · pg (node-postgres)  
**Banco:** PostgreSQL 15  
**Infra:** Docker · Docker Compose  
**Padrões:** Clean Architecture · SOLID · Repository Pattern · Dependency Injection

## 📝 Variáveis de Ambiente

Cada serviço lê `.env` na raiz do serviço. Variáveis principais:

```env
DATABASE_URL=postgresql://empregabilidade:senha_segura_123@postgres:5432/empregabilidade_db
JWT_SECRET=sua_chave_secreta
PORT=3002
NODE_ENV=development
```

## 🔐 Banco de Dados (credenciais padrão Docker)

```
Host: localhost:5432
Database: empregabilidade_db
User: empregabilidade
Password: senha_segura_123
```

## 🛠️ Troubleshooting

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

## 📁 Estrutura de Pastas

```
├── apps/
│   └── frontend/src/
│       ├── pages/           # CompaniesPage, WorkersPage, VacanciesPage, AssistancePage, DashboardPage
│       ├── components/      # Button, Input, Modal, Table, Toast, Sidebar, Card...
│       └── api/apiClient.ts # Instâncias Axios por serviço
├── services/
│   ├── auth/src/            # Clean Architecture (domain/application/infrastructure/presentation)
│   ├── workers/src/index.ts
│   ├── referrals/src/index.ts  # Empresas + Vagas
│   ├── assistance/src/index.ts
│   └── shared/database/init.sql
├── docker-compose.yml
└── package.json
```

## 📄 Licença

Projeto acadêmico integrador — 2026.
