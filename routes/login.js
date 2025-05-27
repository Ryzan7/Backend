const express = require('express');
const router = express.Router();

// Credenciais fixas
const admin = {
  username: 'admin',
  password: 'senha123' // Ideal usar bcrypt se for algo mais seguro
};

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === admin.username && password === admin.password) {
    return res.status(200).json({ mensagem: 'Login realizado com sucesso!' });
  }

  return res.status(401).json({ mensagem: 'Usuário ou senha inválidos.' });
});

module.exports = router;
