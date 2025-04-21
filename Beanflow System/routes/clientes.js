const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET - listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - adicionar novo cliente
router.post('/', async (req, res) => {
  const { nome, razao_social, cnpj, telefone, email } = req.body;

  if (!nome || !cnpj) {
    return res.status(400).json({ error: 'Nome e CNPJ são obrigatórios' });
  }

  try {
    const query = `
      INSERT INTO clientes (nome, razao_social, cnpj, telefone, email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [nome, razao_social, cnpj, telefone, email];
    const result = await pool.query(query, values);

    res.status(201).json({ message: 'Cliente criado com sucesso!', cliente: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'CNPJ já cadastrado' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;