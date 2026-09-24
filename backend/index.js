const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// ==========================================
// 1. CONFIGURAÇÕES GERAIS
// ==========================================
app.use(cors());
app.use(express.json());


// ==========================================
// 2. "BANCO DE DADOS" EM MEMÓRIA
// ==========================================
let rankingGlobal = [];
let usuariosDb = [];

const questionarioSemanal = [
    {
        id: 1,
        pergunta: "Como você lidou com aquele usuário de suporte que abriu um chamado dizendo que a internet caiu, mas o cabo estava fora?",
        opcoes: [
            { texto: "Expliquei com paciência e fechei o chamado", pontos: 500 },
            { texto: "Ignorei e fui jogar", pontos: -300 },
            { texto: "Dei uma bronca disfarçada de dica técnica", pontos: -100 }
        ]
    },
    {
        id: 2,
        pergunta: "Na hora de iniciar um novo projeto de desenvolvimento ou criar um jogo novo, qual foi sua atitude?",
        opcoes: [
            { texto: "Defini o planejamento funcional antes de botar a mão na massa", pontos: 1500 },
            { texto: "Saí codando direto na loucura", pontos: -800 },
            { texto: "Fiquei enrolando assistindo tutorial", pontos: -200 }
        ]
    },
    {
        id: 3,
        pergunta: "Você notou que o uso de RAM estava alto, mas o sistema continuava rápido. O que você fez?",
        opcoes: [
            { texto: "Deixei quieto, memória ociosa é memória desperdiçada", pontos: 500 },
            { texto: "Rodei um script de limpeza no terminal pra garantir", pontos: 800 },
            { texto: "Entrei em pânico e reiniciei a máquina", pontos: -400 }
        ]
    },
    {
        id: 4,
        pergunta: "Alguém questionou o seu gosto para animes. Como você reagiu?",
        opcoes: [
            { texto: "Fez uma pose de JoJo em público para intimidar", pontos: 2000 },
            { texto: "Recomendou assistir pelo menos os primeiros episódios", pontos: 300 },
            { texto: "Concordou só para evitar a fadiga", pontos: -500 }
        ]
    }
];


// ==========================================
// 3. ROTAS DA APLICAÇÃO
// ==========================================

// Rota de saúde do servidor
app.get('/', (req, res) => {
    res.json({ status: "Servidor da Calculadora de Aura 100% operacional!" });
});

// Cadastro de usuário
app.post('/registro', (req, res) => {
    const { usuario, senha } = req.body;
    
    if (usuariosDb.find(u => u.usuario === usuario)) {
        return res.status(400).json({ erro: "Este usuário já existe. Tente outro!" });
    }
    
    usuariosDb.push({ usuario, senha });
    res.json({ mensagem: "Conta criada com sucesso! Faça login para jogar." });
});

// Login de usuário
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    
    const usuarioEncontrado = usuariosDb.find(u => u.usuario === usuario && u.senha === senha);
    
    if (!usuarioEncontrado) {
        return res.status(401).json({ erro: "Aura fraca: Usuário ou senha incorretos." });
    }
    
    res.json({ mensagem: "Login autorizado!", usuario: usuarioEncontrado.usuario });
});

// Buscar questionário semanal
app.get('/questionario', (req, res) => {
    res.json(questionarioSemanal);
});

// Receber respostas e salvar pontuação da semana
app.post('/calcular-semana', (req, res) => {
    const { usuario, totalPontos } = req.body;

    const index = rankingGlobal.findIndex(u => u.nome === usuario);
    
    if (index !== -1) {
        rankingGlobal[index].pontos = totalPontos;
    } else {
        rankingGlobal.push({ nome: usuario, pontos: totalPontos });
    }

    res.json({ 
        mensagem: `Questionário concluído! Sua aura da semana foi definida como ${totalPontos}.` 
    });
});

// Listar o ranking geral
app.get('/ranking', (req, res) => {
    const rankingOrdenado = [...rankingGlobal].sort((a, b) => b.pontos - a.pontos);
    res.json(rankingOrdenado);
});


// ==========================================
// 4. INICIALIZAÇÃO
// ==========================================
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});