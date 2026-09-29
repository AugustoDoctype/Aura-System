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
        pergunta: "Um amigo te manda um Reels/TikTok de 3 minutos sobre um assunto que você não liga. O que você faz?",
        opcoes: [
            { texto: "Assisto no 2x e mando 'mt bom kkkk' pra não magoar", pontos: 500 },
            { texto: "Deixo no vácuo e finjo que o app bugou", pontos: -800 },
            { texto: "Mando outro vídeo de 5 minutos de volta como vingança", pontos: -300 }
        ]
    },
    {
        id: 2,
        pergunta: "Você entra na call do Discord e alguém liga um áudio estourado no bot de música (tipo o Loritta). Qual a sua reação?",
        opcoes: [
            { texto: "Muto o cara silenciosamente e sigo a vida", pontos: 1000 },
            { texto: "Começo a gritar no mic pedindo pra abaixar", pontos: -500 },
            { texto: "Coloco uma música ainda mais estourada pra disputar território", pontos: -1500 }
        ]
    },
    {
        id: 3,
        pergunta: "Alguém solta gírias como 'Sigma', 'Skibidi' ou começa a fazer 'Mewing' não-ironicamente na roda de conversa. Como você lida?",
        opcoes: [
            { texto: "Faço mewing de volta para manter o silêncio absoluto", pontos: 2000 },
            { texto: "Dou uma palestra de 10 minutos sobre como isso é cringe", pontos: -2000 },
            { texto: "Balanço a cabeça e mudo de assunto discretamente", pontos: 300 }
        ]
    },
    {
        id: 4,
        pergunta: "Você vê uma discussão séria no Twitter (X) sobre quem venceria uma luta: Goku ou Saitama. O que você faz?",
        opcoes: [
            { texto: "Silencio a thread e vou jogar algo de útil", pontos: 1500 },
            { texto: "Escrevo uma thread de 15 tweets provando que o Ben 10 ganha", pontos: -1000 },
            { texto: "Comento só um 'F' e vejo o caos acontecer", pontos: 500 }
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

// Rota secreta de Auditoria: Ver todos os usuários cadastrados
app.get('/usuarios', (req, res) => {
    // Retorna a lista completa de usuários (usuario e senha)
    res.json({
        total_cadastrados: usuariosDb.length,
        usuarios: usuariosDb
    });
});


// ==========================================
// 4. INICIALIZAÇÃO
// ==========================================
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});