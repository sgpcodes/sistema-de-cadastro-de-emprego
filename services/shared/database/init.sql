-- Workers Table
CREATE TABLE IF NOT EXISTS trabalhadores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  escolaridade VARCHAR(100),
  profissao VARCHAR(255),
  experiencia TEXT,
  status VARCHAR(50) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'ENCAMINHADO', 'CONTRATADO', 'INATIVO')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(14) UNIQUE,
  ramo_atividade VARCHAR(255),
  porte VARCHAR(50),
  qtd_funcionarios INTEGER,
  cep VARCHAR(10),
  endereco VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  localizacao VARCHAR(255),
  nome_responsavel VARCHAR(255),
  cargo_responsavel VARCHAR(100),
  contato VARCHAR(255),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  email VARCHAR(255),
  whatsapp VARCHAR(20),
  site VARCHAR(255),
  observacoes TEXT,
  beneficios TEXT,
  horario_funcionamento VARCHAR(255),
  status VARCHAR(50) DEFAULT 'ATIVA',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vacancies Table
CREATE TABLE IF NOT EXISTS vagas (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
  cargo VARCHAR(255) NOT NULL,
  requisitos TEXT,
  salario DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'ABERTA' CHECK (status IN ('ABERTA', 'PREENCHIDA', 'CANCELADA')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS encaminhamentos (
  id SERIAL PRIMARY KEY,
  trabalhador_id INTEGER,
  vaga_id INTEGER REFERENCES vagas(id) ON DELETE CASCADE,
  data_encaminhamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'PENDENTE',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assistance Table (standalone — no FK to trabalhadores required)
CREATE TABLE IF NOT EXISTS atendimentos (
  id SERIAL PRIMARY KEY,
  trabalhador_id INTEGER,
  nome_atendido VARCHAR(255),
  cpf_atendido VARCHAR(11),
  telefone_atendido VARCHAR(20),
  escolaridade VARCHAR(100),
  profissao VARCHAR(255),
  experiencia TEXT,
  cargo_desejado VARCHAR(255),
  tipo VARCHAR(100),
  descricao TEXT,
  data_atendimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'CONCLUIDO',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trabalhadores_status ON trabalhadores(status);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status);
CREATE INDEX IF NOT EXISTS idx_vagas_empresa_id ON vagas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vagas_status ON vagas(status);
CREATE INDEX IF NOT EXISTS idx_atendimentos_tipo ON atendimentos(tipo);
CREATE INDEX IF NOT EXISTS idx_atendimentos_criado_em ON atendimentos(criado_em);
