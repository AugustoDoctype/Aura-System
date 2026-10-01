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
        pergunta: "Você tá no clutch 1v5 num jogo competitivo, o time todo tá gritando na call do Discord e dando call errada. O que você faz?",
        opcoes: [
            { texto: "Muto todo mundo na hora, dou 5 headshots e nem comemoro", pontos: 2000 },
            { texto: "Quito da partida pra não estragar meu KDA e mando 'GG time lixo' no chat", pontos: -1500 },
            { texto: "Abro o microfone, dou um grito que estoura o fone de todo mundo e morro pro primeiro pixel", pontos: -800 }
        ]
    },
    {
        id: 2,
        pergunta: "O professor pede pra formar dupla pra um trabalho valendo metade da nota do bimestre. Qual a sua estratégia?",
        opcoes: [
            { texto: "Faço o trabalho todo sozinho, coloco o nome do meu amigo que faltou e não cobro nada", pontos: 1500 },
            { texto: "Entro na dupla do nerd da sala, pergunto se ele precisa de ajuda e durmo a aula inteira", pontos: 300 },
            { texto: "Digo que vou fazer sozinho, esqueço a data e tento subornar o professor com um salgado da cantina", pontos: -1200 }
        ]
    },
    {
        id: 3,
        pergunta: "Você tá há 3 horas no mesmo chefe de um jogo estilo 'Souls', ele tá com 1 de vida e te mata com um golpe injusto. Reação?",
        opcoes: [
            { texto: "Respiro fundo, desligo o monitor e vou beber uma água em silêncio absoluto", pontos: 2500 },
            { texto: "Mordo o controle/teclado, abro o YouTube e procuro 'como derrotar chefe com bug'", pontos: -600 },
            { texto: "Quebro o mouse na mesa e posto um story de 3 linhas reclamando da física do jogo", pontos: -2000 }
        ]
    },
    {
        id: 4,
        pergunta: "Seu amigo posta um story no Instagram achando que tá muito 'Sigma', mas na verdade tá puro cringe. O que você faz?",
        opcoes: [
            { texto: "Comento 'Aura +10000 🗿🍷' só pra alimentar a ilusão dele", pontos: 1000 },
            { texto: "Tiro print e mando no grupo secreto da turma pra todo mundo dar risada junto", pontos: -1800 },
            { texto: "Salvo a foto e crio uma figurinha de WhatsApp que vai perseguir ele pelos próximos 5 anos", pontos: 800 }
        ]
    },
    {
        id: 5,
        pergunta: "No meio de um minigame com a galera (tipo Roblox ou Party Animals), você ganha a chance de derrubar seu melhor amigo na lava e vencer. E aí?",
        opcoes: [
            { texto: "Empurro ele sem hesitar enquanto dou uma risada maligna na call", pontos: 1200 },
            { texto: "Deixo ele ganhar porque amizade vale mais que vitória em jogo", pontos: -500 },
            { texto: "Tento dar um pulo estiloso pra comemorar antes e caio na lava junto com ele", pontos: -1000 }
        ]
    },
    {
        id: 6,
        pergunta: "A porção de batata frita de todo mundo chega na mesa do fast-food. Como você se comporta?",
        opcoes: [
            { texto: "Pago o refrigerante de todo mundo pra ter direito irrestrito às batatas", pontos: 1500 },
            { texto: "Pego só duas batatas pra não parecer esfomeado, mas fico encarando o pote", pontos: 200 },
            { texto: "Faço uma concha com a mão e pego metade da porção de uma vez só", pontos: -1500 }
        ]
    },
    {
        id: 7,
        pergunta: "Saiu uma skin lendária exclusiva de R$ 150 no seu jogo favorito, mas você só tem R$ 160 na conta do banco. O que faz?",
        opcoes: [
            { texto: "Resisto à tentação, fecho a loja do jogo e vou comer um pastel na rua", pontos: 2000 },
            { texto: "Compro a skin na hora. Comida é temporária, o drip no jogo é eterno", pontos: 1000 },
            { texto: "Compro a skin e peço dinheiro emprestado pro amigo prometendo pagar 'semana que vem'", pontos: -1500 }
        ]
    },
    {
        id: 8,
        pergunta: "Você entra num grupo novo de WhatsApp da galera e ninguém te conhece direito ainda. Qual sua primeira mensagem?",
        opcoes: [
            { texto: "Mando um meme completamente sem sentido e saio sem dar explicações", pontos: 1200 },
            { texto: "Mando só um 'fala dele' e espero alguém responder", pontos: 500 },
            { texto: "Mando um áudio de 4 minutos contando a história da minha vida", pontos: -1200 }
        ]
    },
    {
        id: 9,
        pergunta: "No rolê te passam a caixinha de som Bluetooth e pedem pra você colocar uma música. O que toca?",
        opcoes: [
            { texto: "Pergunto o que a galera quer ouvir e viro o DJ oficial da festa", pontos: 1800 },
            { texto: "Mando a playlist de trap/funk mais estourada no volume máximo", pontos: 600 },
            { texto: "Coloco a abertura de um anime nichado de 2012 que só eu conheço", pontos: -800 }
        ]
    },
    {
        id: 10,
        pergunta: "São 3:30 da manhã de um domingo pra segunda-feira e você tem aula às 7h. Qual a decisão?",
        opcoes: [
            { texto: "Viro a noite jogando, tomo um energético de manhã e finjo que sou invencível", pontos: 1500 },
            { texto: "Mando mensagem no grupo da sala perguntando se alguém vai faltar amanhã", pontos: 700 },
            { texto: "Fecho o computador na hora, deito e fico 3 horas encarando o teto sem dormir", pontos: -400 }
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
    
    // MEDIDA DE SEGURANÇA: Se o utilizador já existe no ranking desta semana, bloqueia!
    if (index !== -1) {
        return res.status(403).json({ 
            erro: "Operação Negada: Já auditaste a tua Aura esta semana. Aguarda a próxima ronda!" 
        });
    } 
    
    // Se não existir, salva a pontuação
    rankingGlobal.push({ nome: usuario, pontos: totalPontos });

    res.json({ 
        mensagem: `Auditoria concluída! A tua aura da semana foi definida como ${totalPontos}.` 
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