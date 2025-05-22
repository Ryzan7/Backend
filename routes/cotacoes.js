const express = require('express');
const pool = require('../db');
const router = express.Router();

// Função para remover acentos e cedilha
const normalizeText = (text) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c").replace(/Ç/g, "C");
};

// GET - Listar todas as cotações
router.get('/', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cotacoes");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Buscar cotação por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM cotacoes WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cotação não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Criar nova cotação
router.post('/', async (req, res) => {
  console.log("Requisição recebida:", req.body);

  delete req.body.status;
  let { etapa, observacoes, cliente_id, valor_total, data_criacao } = req.body;

  if (!cliente_id) {
    return res.status(400).json({ error: 'O campo cliente_id é obrigatório' });
  }

  // Normaliza a etapa, se houver
  etapa = etapa ? normalizeText(etapa) : 'Realizar orcamento';

  // Verifica se data_criacao está preenchida corretamente
  const dataCotacao = (data_criacao && data_criacao.trim() !== '') ? data_criacao : null;

  try {
    const query = `
      INSERT INTO cotacoes (etapa, observacoes, cliente_id, valor_total, data_criacao)
      VALUES ($1, $2, $3, $4, COALESCE($5, DEFAULT))
      RETURNING *;
    `;
    const values = [etapa, observacoes, cliente_id, valor_total, dataCotacao];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Cotacao criada com sucesso!', cotacao: result.rows[0] });
  } catch (err) {
    console.error("Erro ao criar cotacao:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Atualizar uma cotação por ID
router.put('/:id', async (req, res) => {
  delete req.body.status;
  const { id } = req.params;
  let { etapa, observacoes, valor_total } = req.body;

  // Normaliza a etapa, se houver
  etapa = etapa ? normalizeText(etapa) : null;

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
      return res.status(404).json({ error: 'Cotacao nao encontrada' });
    }

    res.json({ message: 'Cotacao atualizada com sucesso!', cotacao: result.rows[0] });
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
      return res.status(404).json({ error: 'Cotacao nao encontrada' });
    }

    res.json({ message: 'Cotacao deletada com sucesso!', cotacao: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;