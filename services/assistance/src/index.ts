import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 3004;
const DATABASE_URL = process.env.DATABASE_URL || '';

const pool = new Pool({ connectionString: DATABASE_URL });

app.use(express.json());
app.use(cors());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Assistance Service is running' });
});

// Unemployment Insurance CRUD
app.post('/unemployment-insurance', async (req, res) => {
  try {
    const { trabalhadorId, dataInicio, dataFim, valorParcela, parcelasTotais } = req.body;
    const result = await pool.query(
      `INSERT INTO seguros_desemprego (trabalhador_id, data_inicio, data_fim, valor_parcela, parcelas_totais)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [trabalhadorId, dataInicio, dataFim, valorParcela, parcelasTotais]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.get('/unemployment-insurance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM seguros_desemprego WHERE trabalhador_id = $1',
      [id]
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

// Assistance Records CRUD
app.post('/assistance', async (req, res) => {
  try {
    const { trabalhadorId, tipo, descricao } = req.body;
    const result = await pool.query(
      `INSERT INTO atendimentos (trabalhador_id, tipo, descricao)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [trabalhadorId, tipo, descricao]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

app.get('/assistance', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM atendimentos');
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/assistance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM atendimentos WHERE trabalhador_id = $1',
      [id]
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Assistance Service running on port ${PORT}`);
});
