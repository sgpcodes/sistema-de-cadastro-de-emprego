import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3003;
const DATABASE_URL = process.env.DATABASE_URL || '';

const pool = new Pool({ connectionString: DATABASE_URL });

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? true,
  credentials: true,
}));

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        cnpj VARCHAR(14) UNIQUE,
        contato VARCHAR(255),
        email VARCHAR(255),
        telefone VARCHAR(20),
        localizacao VARCHAR(255),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS vagas (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
        cargo VARCHAR(255) NOT NULL,
        requisitos TEXT,
        salario DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'ABERTA',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS encaminhamentos (
        id SERIAL PRIMARY KEY,
        trabalhador_id INTEGER,
        vaga_id INTEGER REFERENCES vagas(id) ON DELETE CASCADE,
        data_encaminhamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'PENDENTE',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Make cnpj nullable
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE empresas ALTER COLUMN cnpj DROP NOT NULL;
      EXCEPTION WHEN others THEN NULL;
      END $$;
    `);

    // Add new company columns
    const empresaCols: [string, string][] = [
      ['localizacao', 'VARCHAR(255)'],
      ['nome_fantasia', 'VARCHAR(255)'],
      ['ramo_atividade', 'VARCHAR(255)'],
      ['porte', 'VARCHAR(50)'],
      ['qtd_funcionarios', 'INTEGER'],
      ['cep', 'VARCHAR(10)'],
      ['endereco', 'VARCHAR(255)'],
      ['numero', 'VARCHAR(20)'],
      ['complemento', 'VARCHAR(100)'],
      ['bairro', 'VARCHAR(100)'],
      ['cidade', 'VARCHAR(100)'],
      ['estado', 'VARCHAR(2)'],
      ['nome_responsavel', 'VARCHAR(255)'],
      ['cargo_responsavel', 'VARCHAR(100)'],
      ['celular', 'VARCHAR(20)'],
      ['whatsapp', 'VARCHAR(20)'],
      ['site', 'VARCHAR(255)'],
      ['observacoes', 'TEXT'],
      ['beneficios', 'TEXT'],
      ['horario_funcionamento', 'VARCHAR(255)'],
      ['status', "VARCHAR(50) DEFAULT 'ATIVA'"],
    ];

    for (const [col, type] of empresaCols) {
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='empresas' AND column_name='${col}'
          ) THEN
            ALTER TABLE empresas ADD COLUMN ${col} ${type};
          END IF;
        END $$;
      `);
    }

    // Add vacancy columns
    const vagaCols: [string, string][] = [
      ['cargo', 'VARCHAR(255)'],
      ['requisitos', 'TEXT'],
      ['salario', 'DECIMAL(10,2)'],
      ['status', "VARCHAR(50) DEFAULT 'ABERTA'"],
      ['criado_em', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'],
    ];

    for (const [col, type] of vagaCols) {
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='vagas' AND column_name='${col}'
          ) THEN
            ALTER TABLE vagas ADD COLUMN ${col} ${type};
          END IF;
        END $$;
      `);
    }

    console.log('Referrals Service: migrations aplicadas com sucesso.');
  } catch (err) {
    console.error('Referrals Service: erro ao aplicar migrations:', err);
  } finally {
    client.release();
  }
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Referrals Service is running' });
});

// ── Companies ──────────────────────────────────────────────────────────────

app.get('/companies', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*,
        COUNT(v.id) AS total_vagas,
        COUNT(v.id) FILTER (WHERE v.status = 'ABERTA') AS vagas_abertas,
        COUNT(v.id) FILTER (WHERE v.status = 'PREENCHIDA') AS vagas_preenchidas,
        COUNT(v.id) FILTER (WHERE v.status = 'CANCELADA') AS vagas_canceladas
      FROM empresas e
      LEFT JOIN vagas v ON v.empresa_id = e.id
      GROUP BY e.id
      ORDER BY e.razao_social
    `);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await pool.query(
      `SELECT e.*,
        COUNT(v.id) AS total_vagas,
        COUNT(v.id) FILTER (WHERE v.status = 'ABERTA') AS vagas_abertas,
        COUNT(v.id) FILTER (WHERE v.status = 'PREENCHIDA') AS vagas_preenchidas,
        COUNT(v.id) FILTER (WHERE v.status = 'CANCELADA') AS vagas_canceladas
       FROM empresas e
       LEFT JOIN vagas v ON v.empresa_id = e.id
       WHERE e.id = $1
       GROUP BY e.id`,
      [id]
    );
    if (empresa.rows.length === 0) {
      return res.status(404).json({ erro: 'Empresa não encontrada' });
    }
    const vagas = await pool.query(
      `SELECT id, cargo, status, salario, criado_em FROM vagas WHERE empresa_id = $1 ORDER BY criado_em DESC`,
      [id]
    );
    res.status(200).json({ ...empresa.rows[0], vagas: vagas.rows });
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.post('/companies', async (req, res) => {
  try {
    const {
      razao_social, nome_fantasia, cnpj, ramo_atividade, porte, qtd_funcionarios,
      cep, endereco, numero, complemento, bairro, cidade, estado,
      nome_responsavel, cargo_responsavel, telefone, celular, email, whatsapp,
      site, observacoes, beneficios, horario_funcionamento, status,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO empresas (
        razao_social, nome_fantasia, cnpj, ramo_atividade, porte, qtd_funcionarios,
        cep, endereco, numero, complemento, bairro, cidade, estado,
        nome_responsavel, cargo_responsavel, telefone, celular, email, whatsapp,
        site, observacoes, beneficios, horario_funcionamento, status,
        localizacao
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25
      ) RETURNING *`,
      [
        razao_social,
        nome_fantasia || null,
        cnpj ? cnpj.replace(/\D/g, '').slice(0, 14) : null,
        ramo_atividade || null,
        porte || null,
        qtd_funcionarios ? parseInt(qtd_funcionarios) : null,
        cep || null,
        endereco || null,
        numero || null,
        complemento || null,
        bairro || null,
        cidade || null,
        estado || null,
        nome_responsavel || null,
        cargo_responsavel || null,
        telefone || null,
        celular || null,
        email || null,
        whatsapp || null,
        site || null,
        observacoes || null,
        beneficios || null,
        horario_funcionamento || null,
        status || 'ATIVA',
        cidade && estado ? `${cidade} - ${estado}` : (cidade || estado || null),
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.put('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      razao_social, nome_fantasia, cnpj, ramo_atividade, porte, qtd_funcionarios,
      cep, endereco, numero, complemento, bairro, cidade, estado,
      nome_responsavel, cargo_responsavel, telefone, celular, email, whatsapp,
      site, observacoes, beneficios, horario_funcionamento, status,
    } = req.body;

    const result = await pool.query(
      `UPDATE empresas SET
        razao_social=$1, nome_fantasia=$2, cnpj=$3, ramo_atividade=$4, porte=$5,
        qtd_funcionarios=$6, cep=$7, endereco=$8, numero=$9, complemento=$10,
        bairro=$11, cidade=$12, estado=$13, nome_responsavel=$14, cargo_responsavel=$15,
        telefone=$16, celular=$17, email=$18, whatsapp=$19, site=$20,
        observacoes=$21, beneficios=$22, horario_funcionamento=$23, status=$24,
        localizacao=$25, atualizado_em=CURRENT_TIMESTAMP
       WHERE id=$26 RETURNING *`,
      [
        razao_social,
        nome_fantasia || null,
        cnpj ? cnpj.replace(/\D/g, '').slice(0, 14) : null,
        ramo_atividade || null,
        porte || null,
        qtd_funcionarios ? parseInt(qtd_funcionarios) : null,
        cep || null,
        endereco || null,
        numero || null,
        complemento || null,
        bairro || null,
        cidade || null,
        estado || null,
        nome_responsavel || null,
        cargo_responsavel || null,
        telefone || null,
        celular || null,
        email || null,
        whatsapp || null,
        site || null,
        observacoes || null,
        beneficios || null,
        horario_funcionamento || null,
        status || 'ATIVA',
        cidade && estado ? `${cidade} - ${estado}` : (cidade || estado || null),
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Empresa não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.delete('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM empresas WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Empresa não encontrada' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

// ── Vacancies ──────────────────────────────────────────────────────────────

app.post('/vacancies', async (req, res) => {
  const client = await pool.connect();
  try {
    const { empresa_id, empresa, localizacao, cargo, requisitos, salario, status } = req.body;

    let empresaId: number | null = null;

    if (empresa_id) {
      empresaId = parseInt(empresa_id);
    } else if (empresa) {
      const existing = await client.query(
        'SELECT id FROM empresas WHERE LOWER(razao_social) = LOWER($1) LIMIT 1',
        [empresa]
      );
      if (existing.rows.length > 0) {
        empresaId = existing.rows[0].id;
      } else {
        const created = await client.query(
          'INSERT INTO empresas (razao_social, localizacao) VALUES ($1, $2) RETURNING id',
          [empresa, localizacao || null]
        );
        empresaId = created.rows[0].id;
      }
    }

    const result = await client.query(
      `INSERT INTO vagas (empresa_id, cargo, requisitos, salario, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [empresaId, cargo, requisitos || null, salario ? parseFloat(salario) : null, status || 'ABERTA']
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  } finally {
    client.release();
  }
});

app.get('/vacancies', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*,
        e.razao_social AS empresa_nome,
        e.localizacao AS empresa_localizacao,
        e.cidade AS empresa_cidade,
        e.estado AS empresa_estado,
        e.telefone AS empresa_telefone,
        e.celular AS empresa_celular,
        e.email AS empresa_email,
        e.nome_responsavel AS empresa_responsavel,
        e.endereco AS empresa_endereco
      FROM vagas v
      LEFT JOIN empresas e ON v.empresa_id = e.id
      ORDER BY v.criado_em DESC
    `);
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT v.*,
        e.razao_social AS empresa_nome,
        e.localizacao AS empresa_localizacao,
        e.cidade AS empresa_cidade,
        e.estado AS empresa_estado,
        e.telefone AS empresa_telefone,
        e.celular AS empresa_celular,
        e.email AS empresa_email,
        e.nome_responsavel AS empresa_responsavel,
        e.endereco AS empresa_endereco
       FROM vagas v
       LEFT JOIN empresas e ON v.empresa_id = e.id
       WHERE v.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Vaga não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.put('/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE vagas SET status = $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Vaga não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.delete('/vacancies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vagas WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Vaga não encontrada' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

// ── Referrals ──────────────────────────────────────────────────────────────

app.post('/referrals', async (req, res) => {
  try {
    const { trabalhadorId, vagaId } = req.body;
    const result = await pool.query(
      `INSERT INTO encaminhamentos (trabalhador_id, vaga_id) VALUES ($1, $2) RETURNING *`,
      [trabalhadorId, vagaId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.get('/referrals', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM encaminhamentos');
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.put('/referrals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE encaminhamentos SET status = $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Encaminhamento não encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`Referrals Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Referrals Service: falha nas migrations, iniciando mesmo assim:', err);
  app.listen(PORT, () => {
    console.log(`Referrals Service running on port ${PORT}`);
  });
});
