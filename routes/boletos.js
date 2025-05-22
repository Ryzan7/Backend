const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET - Listar todos os boletos com status calculado dinamicamente
router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          b.*,
          CASE
            WHEN pago THEN 'PAGO 🟩'
            WHEN vencimento < CURRENT_DATE THEN 'VENCIDO 🟥'
            WHEN vencimento = CURRENT_DATE THEN 'VENCE HOJE 🟥'
            WHEN vencimento <= CURRENT_DATE + INTERVAL '3 days' THEN 'VENCE EM ATÉ 3 DIAS 🟧'
            WHEN vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN 'VENCE EM ATÉ 7 DIAS 🟨'
            WHEN vencimento <= CURRENT_DATE + INTERVAL '14 days' THEN 'VENCE EM ATÉ 14 DIAS 🟩'
            ELSE 'VENCE EM 15+ DIAS ⬜'
          END AS status,
          (vencimento - CURRENT_DATE) AS dias_para_vencimento
        FROM boletos b
        ORDER BY vencimento;
      `);
  
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET - Buscar boleto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        CASE
          WHEN pago THEN 'PAGO 🟩'
          WHEN vencimento < CURRENT_DATE THEN 'VENCIDO 🟥'
          WHEN vencimento = CURRENT_DATE THEN 'VENCE HOJE 🟥'
          WHEN vencimento <= CURRENT_DATE + INTERVAL '3 days' THEN 'VENCE EM ATÉ 3 DIAS 🟧'
          WHEN vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN 'VENCE EM ATÉ 7 DIAS 🟨'
          WHEN vencimento <= CURRENT_DATE + INTERVAL '14 days' THEN 'VENCE EM ATÉ 14 DIAS 🟩'
          ELSE 'VENCE EM 15+ DIAS ⬜'
        END AS status,
        (vencimento - CURRENT_DATE) AS dias_para_vencimento
      FROM boletos b
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Boleto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Criar novo boleto
router.post('/', async (req, res) => {
  const { data_criacao, vencimento, valor, pago, data_pagamento, cliente_id, cotacao_id } = req.body;

  if (!vencimento || !valor || !cliente_id) {
    return res.status(400).json({ error: 'Vencimento, valor e cliente_id são obrigatórios' });
  }

  try {
    const query = `
      INSERT INTO boletos (data_criacao, vencimento, valor, pago, data_pagamento, cliente_id, cotacao_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [data_criacao || new Date(), vencimento, valor, pago || false, data_pagamento, cliente_id, cotacao_id];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Boleto criado com sucesso!', boleto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Atualizar um boleto por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { vencimento, valor, pago, data_pagamento } = req.body;

  try {
    const query = `
      UPDATE boletos
      SET vencimento = COALESCE($1, vencimento),
          valor = COALESCE($2, valor),
          pago = COALESCE($3, pago),
          data_pagamento = COALESCE($4, data_pagamento)
      WHERE id = $5
      RETURNING *;
    `;
    const values = [vencimento, valor, pago, data_pagamento, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Boleto não encontrado' });
    }

    res.json({ message: 'Boleto atualizado com sucesso!', boleto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Deletar um boleto por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM boletos WHERE id = $1 RETURNING *;', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Boleto não encontrado' });
    }

    res.json({ message: 'Boleto deletado com sucesso!', boleto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;