const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Array para armazenar histórico de dados (opcional)
let historicoDados = [];

// Rota principal para teste
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: 'sucesso',
        message: 'API para dados do ESP32 está funcionando!',
        timestamp: new Date().toISOString(),
        total_dados_recebidos: historicoDados.length
    });
});

// Rota de saúde da API
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'API IoT ESP32',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Rota para receber dados do ESP32
app.post('/dados', (req, res) => {
    const timestamp = new Date().toISOString();
    const { temperatura, vazao_lpm } = req.body;

    console.log(`\n=== NOVA REQUISIÇÃO ===`);
    console.log(`[${timestamp}]`);
    console.log('Headers:', req.headers);
    console.log('IP:', req.ip || req.connection.remoteAddress);
    console.log('Dados recebidos:', { temperatura, vazao_lpm });

    // Validação dos dados
    if (temperatura === undefined || vazao_lpm === undefined) {
        console.log('❌ Dados incompletos recebidos');
        return res.status(400).json({ 
            status: 'erro', 
            message: 'Dados incompletos. "temperatura" e "vazao_lpm" são obrigatórios.',
            timestamp 
        });
    }

    // Validação de valores numéricos
    if (isNaN(temperatura) || isNaN(vazao_lpm)) {
        console.log('❌ Dados inválidos recebidos');
        return res.status(400).json({ 
            status: 'erro', 
            message: 'Dados inválidos. "temperatura" e "vazao_lpm" devem ser números.',
            timestamp 
        });
    }

    // Armazenar no histórico (limitar a 1000 registros)
    const dado = {
        temperatura: parseFloat(temperatura),
        vazao_lpm: parseFloat(vazao_lpm),
        timestamp,
        ip: req.ip || req.connection.remoteAddress
    };
    
    historicoDados.push(dado);
    if (historicoDados.length > 1000) {
        historicoDados = historicoDados.slice(-1000);
    }

    console.log(`✅ Dados armazenados: Temperatura: ${temperatura}°C, Vazão: ${vazao_lpm} L/min`);
    console.log(`📊 Total de registros: ${historicoDados.length}`);

    // Resposta de sucesso
    res.status(200).json({ 
        status: 'sucesso', 
        message: 'Dados recebidos com sucesso!',
        timestamp,
        dados_recebidos: dado,
        total_registros: historicoDados.length
    });
});

// Rota para visualizar histórico (apenas para debug)
app.get('/historico', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const historicoLimitado = historicoDados.slice(-limit);
    
    res.status(200).json({
        status: 'sucesso',
        total_registros: historicoDados.length,
        mostrando_ultimos: historicoLimitado.length,
        historico: historicoLimitado
    });
});

// Rota para limpar histórico (apenas para debug)
app.delete('/historico', (req, res) => {
    const quantidadeAntiga = historicoDados.length;
    historicoDados = [];
    
    res.status(200).json({
        status: 'sucesso',
        message: 'Histórico limpo com sucesso',
        registros_removidos: quantidadeAntiga
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'erro',
        message: 'Rota não encontrada',
        endpoint_solicitado: req.originalUrl,
        metodos_validos: ['GET /', 'GET /health', 'POST /dados', 'GET /historico']
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro na API:', err);
    res.status(500).json({
        status: 'erro',
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
    const timestamp = new Date().toISOString();
    console.log(`\n🚀 Servidor IoT API rodando em http://${HOST}:${PORT}`);
    console.log(`📅 Iniciado em: ${timestamp}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'production'}`);
    console.log(`🔧 Porta: ${PORT}`);
    console.log(`📍 Host: ${HOST}`);
    console.log('====================================\n');
});

module.exports = app;