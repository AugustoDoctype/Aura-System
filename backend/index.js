const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Backend da Calculadora de Aura online!' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});