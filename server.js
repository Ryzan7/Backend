require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Importação das rotas
const clientesRoutes = require('./routes/clientes');
const cotacoesRoutes = require('./routes/cotacoes');
const boletosRoutes = require('./routes/boletos');
const tarefasRoutes = require('./routes/tarefas');

// Middlewares
app.use(cors()); // Libera o acesso ao frontend
app.use(express.json()); // Permite receber JSON no body das requisições

// Rota raiz
app.get('/', (req, res) => {
  res.send("🚀 Backend do Beanflow está online!");
});

// Rotas da aplicação
app.use('/clientes', clientesRoutes);
app.use('/cotacoes', cotacoesRoutes);
app.use('/boletos', boletosRoutes);
app.use('/tarefas', tarefasRoutes);

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
