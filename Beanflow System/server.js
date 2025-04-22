require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Rotas
const clientesRoutes = require('./routes/clientes');

const app = express();

// Middlewares
app.use(cors()); // Libera o acesso ao frontend do Lucas
app.use(express.json()); // Permite receber JSON no body das requisições
app.get('/', (req, res) => {
    res.send("🚀 Backend do Beanflow está online!");
  });
  
// Rotas da aplicação
app.use('/clientes', clientesRoutes);

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});