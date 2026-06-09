-- Create Users Table (Authentication)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('ADMIN', 'ATENDENTE', 'EMPRESA', 'TRABALHADOR')),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Workers Table
CREATE TABLE IF NOT EXISTS trabalhadores (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  escolaridade VARCHAR(100),
  profissao VARCHAR(255),
  experiencia TEXT,
  status VARCHAR(50) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'ENCAMINHADO', 'CONTRATADO', 'INATIVO')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Companies Table
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  contato VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(20),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Vacancies Table
CREATE TABLE IF NOT EXISTS vagas (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cargo VARCHAR(255) NOT NULL,
  requisitos TEXT,
  salario DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'ABERTA' CHECK (status IN ('ABERTA', 'PREENCHIDA', 'CANCELADA')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Referrals Table
CREATE TABLE IF NOT EXISTS encaminhamentos (
  id SERIAL PRIMARY KEY,
  trabalhador_id INTEGER NOT NULL REFERENCES trabalhadores(id) ON DELETE CASCADE,
  vaga_id INTEGER NOT NULL REFERENCES vagas(id) ON DELETE CASCADE,
  data_encaminhamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'ACEITO', 'REJEITADO', 'CONTRATADO')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Unemployment Insurance Table
CREATE TABLE IF NOT EXISTS seguros_desemprego (
  id SERIAL PRIMARY KEY,
  trabalhador_id INTEGER NOT NULL REFERENCES trabalhadores(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  valor_parcela DECIMAL(10, 2),
  parcelas_recebidas INTEGER DEFAULT 0,
  parcelas_totais INTEGER,
  status VARCHAR(50) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'CONCLUIDO', 'CANCELADO')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Assistance Table
CREATE TABLE IF NOT EXISTS atendimentos (
  id SERIAL PRIMARY KEY,
  trabalhador_id INTEGER NOT NULL REFERENCES trabalhadores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('PSICOLOGICO', 'ORIENTACAO_PROFISSIONAL', 'CURRICULO', 'OUTRO')),
  descricao TEXT,
  data_atendimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'CONCLUIDO' CHECK (status IN ('AGENDADO', 'REALIZADO', 'CONCLUIDO')),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_trabalhadores_usuario_id ON trabalhadores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_trabalhadores_status ON trabalhadores(status);
CREATE INDEX IF NOT EXISTS idx_vagas_empresa_id ON vagas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vagas_status ON vagas(status);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_trabalhador_id ON encaminhamentos(trabalhador_id);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_vaga_id ON encaminhamentos(vaga_id);
CREATE INDEX IF NOT EXISTS idx_encaminhamentos_status ON encaminhamentos(status);
CREATE INDEX IF NOT EXISTS idx_seguros_trabalhador_id ON seguros_desemprego(trabalhador_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_trabalhador_id ON atendimentos(trabalhador_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_tipo ON atendimentos(tipo);
