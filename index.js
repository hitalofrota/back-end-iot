const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors()); // Permite que a API seja acessada de outras origens
app.use(express.json()); // Permite que a API entenda requisições com corpo em JSON

// 4. Definir a porta
// O Render define a porta através da variável de ambiente PORT. Usamos || 3000 para rodar localmente.
const PORT = process.env.PORT || 3000;

// 5. Criar as Rotas (Endpoints)

// Rota principal (GET /) - Ótima para testar se a API está no ar
app.get('/', (req, res) => {
  res.status(200).send('<h1>API para dados do ESP32 está funcionando!</h1>');
});

// Rota para receber os dados do sensor (POST /dados)
app.post('/dados', (req, res) => {
  // O corpo da requisição (req.body) contém o JSON enviado pelo ESP32
  const { temperatura, vazao_lpm } = req.body;

  // Mostra os dados recebidos no log do servidor (você verá isso no Render)
  console.log(`[DADOS RECEBIDOS] Temperatura: ${temperatura}°C, Vazão: ${vazao_lpm} L/min`);

  // Validação simples para garantir que os dados chegaram
  if (temperatura === undefined || vazao_lpm === undefined) {
    return res.status(400).json({ 
      status: 'erro', 
      message: 'Dados incompletos. "temperatura" e "vazao_lpm" são obrigatórios.' 
    });
  }

  // Se tudo estiver certo, responde ao ESP32 com uma mensagem de sucesso
  res.status(200).json({ 
    status: 'sucesso', 
    message: 'Dados recebidos com sucesso!',
    dados_recebidos: req.body 
  });
});

// 6. Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});