const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET - Listar todas as cotações
router.get('/', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cotacoes");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Criar nova cotação
router.post('/', async (req, res) => {
  const { etapa, observacoes, cliente_id, valor_total } = req.body;

  if (!cliente_id) {
    return res.status(400).json({ error: 'O campo cliente_id é obrigatório' });
  }

  try {
    const query = `
      INSERT INTO cotacoes (etapa, observacoes, cliente_id, valor_total)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [etapa || 'Realizar orçamento', observacoes, cliente_id, valor_total];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Cotação criada com sucesso!', cotacao: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Atualizar uma cotação por ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { etapa, observacoes, valor_total } = req.body;

  try {
    const query = `
      UPDATE cotacoes
      SET etapa = COALESCE($1, etapa),
          observacoes = COALESCE($2, observacoes),
          valor_total = COALESCE($3, valor_total)
      WHERE id = $4
      RETURNING *;
    `;
    const values = [etapa, observacoes, valor_total, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cotação não encontrada' });
    }

    res.json({ message: 'Cotação atualizada com sucesso!', cotacao: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Deletar uma cotação por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM cotacoes WHERE id = $1 RETURNING *;', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cotação não encontrada' });
    }

    res.json({ message: 'Cotação deletada com sucesso!', cotacao: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;