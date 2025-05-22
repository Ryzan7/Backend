const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET - Listar todas as tarefas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tarefas ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Buscar uma tarefa por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM tarefas WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Criar nova tarefa
router.post('/', async (req, res) => {
  const { titulo, descricao } = req.body;

  if (!titulo || !descricao) {
    return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
  }

  try {
    const query = `
      INSERT INTO tarefas (titulo, descricao)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [titulo, descricao];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Tarefa criada com sucesso!', tarefa: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Deletar uma tarefa por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM tarefas WHERE id = $1 RETURNING *;', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }

    res.json({ message: 'Tarefa deletada com sucesso!', tarefa: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;