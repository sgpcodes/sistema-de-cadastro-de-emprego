const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:Emprego123%40@db.pjfkpffcpfrkqgdgptno.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function validate() {
  console.log('Conectando ao Supabase...');
  const client = await pool.connect();

  try {
    const time = await client.query('SELECT NOW()');
    console.log('Conexao OK —', time.rows[0].now);

    console.log('\nExecutando migrations...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        perfil VARCHAR(50) DEFAULT 'user',
        ativo BOOLEAN DEFAULT TRUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  OK usuarios');

    await client.query(`
      CREATE TABLE IF NOT EXISTS trabalhadores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255),
        cpf VARCHAR(11) UNIQUE,
        telefone VARCHAR(20),
        escolaridade VARCHAR(100),
        profissao VARCHAR(255),
        experiencia TEXT,
        status VARCHAR(50) DEFAULT 'ATIVO',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  OK trabalhadores');

    await client.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        nome_fantasia VARCHAR(255),
        cnpj VARCHAR(14),
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
      )
    `);
    console.log('  OK empresas');

    await client.query(`
      CREATE TABLE IF NOT EXISTS vagas (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
        cargo VARCHAR(255) NOT NULL,
        requisitos TEXT,
        salario DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'ABERTA',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  OK vagas');

    await client.query(`
      CREATE TABLE IF NOT EXISTS encaminhamentos (
        id SERIAL PRIMARY KEY,
        trabalhador_id INTEGER,
        vaga_id INTEGER REFERENCES vagas(id) ON DELETE CASCADE,
        data_encaminhamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'PENDENTE',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  OK encaminhamentos');

    await client.query(`
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
      )
    `);
    console.log('  OK atendimentos');

    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('\nTabelas no Supabase:');
    for (const row of tables.rows) {
      const cnt = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      console.log(`  ${row.table_name}: ${cnt.rows[0].count} registro(s)`);
    }

    console.log('\nValidacao completa — Supabase OK!');
  } catch (err) {
    console.error('\nERRO:', err.message);
    if (err.code) console.error('Codigo:', err.code);
  } finally {
    client.release();
    await pool.end();
  }
}

validate();
