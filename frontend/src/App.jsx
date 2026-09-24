import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // ==========================================
  // 1. ESTADOS (Variáveis da Tela)
  // ==========================================
  const [ranking, setRanking] = useState([]);
  const [mensagem, setMensagem] = useState('');
  
  // Sistema de Autenticação
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputSenha, setInputSenha] = useState('');
  const [isRegistro, setIsRegistro] = useState(false);

  // Questionário
  const [questionario, setQuestionario] = useState([]);
  const [respostas, setRespostas] = useState({});

  // ==========================================
  // 2. COMUNICAÇÃO COM A API (BACKEND)
  // ==========================================
  
  const carregarDadosBase = async () => {
    try {
      const resRanking = await fetch('http://localhost:3000/ranking');
      setRanking(await resRanking.json());

      const resQuestoes = await fetch('http://localhost:3000/questionario');
      setQuestionario(await resQuestoes.json());
    } catch (error) {
      setMensagem("Erro ao conectar com o servidor. O backend está rodando?");
    }
  };

  useEffect(() => {
    carregarDadosBase();
  }, []);

  const autenticar = async (e) => {
    e.preventDefault(); 
    const rota = isRegistro ? '/registro' : '/login';
    
    const resposta = await fetch(`http://localhost:3000${rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: inputUsuario, senha: inputSenha })
    });
    
    const dados = await resposta.json();
    
    if (resposta.ok) {
      if (isRegistro) {
        setMensagem(dados.mensagem);
        setIsRegistro(false); 
        setInputSenha(''); 
      } else {
        setUsuarioLogado(dados.usuario); 
        setMensagem('');
      }
    } else {
      setMensagem(dados.erro); 
    }
  };

  // ==========================================
  // 3. MECÂNICA DO QUESTIONÁRIO
  // ==========================================
  
  const selecionarOpcao = (idPergunta, pontos) => {
    setRespostas({ ...respostas, [idPergunta]: pontos });
  };

  const enviarQuestionario = async () => {
    if (Object.keys(respostas).length < questionario.length) {
      setMensagem("Auditoria incompleta: Responda todas as perguntas para processar os dados!");
      return;
    }

    const totalPontos = Object.values(respostas).reduce((acc, pontos) => acc + pontos, 0);

    const resposta = await fetch('http://localhost:3000/calcular-semana', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuarioLogado, totalPontos })
    });
    
    const dados = await resposta.json();
    setMensagem(dados.mensagem);
    carregarDadosBase(); 
  };

  // ==========================================
  // 4. RENDERIZAÇÃO: TELA DE LOGIN
  // ==========================================
  if (!usuarioLogado) {
    return (
      <div className="login-container">
        <h1 className="titulo-neon">Aura System</h1>
        <h2 style={{ fontSize: '1.1rem', color: '#d1d5db', marginBottom: '20px' }}>
          {isRegistro ? 'Criar Nova Conta' : 'Acesso ao Painel'}
        </h2>
        
        <form className="form-login" onSubmit={autenticar}>
          <input 
            type="text" 
            placeholder="Nome de Usuário" 
            className="input-nome" 
            value={inputUsuario}
            onChange={(e) => setInputUsuario(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Senha" 
            className="input-nome" 
            value={inputSenha}
            onChange={(e) => setInputSenha(e.target.value)}
            required
          />
          <button type="submit" className="btn-epico">
            {isRegistro ? 'Registrar Acesso' : 'Entrar'}
          </button>
        </form>

        {mensagem && <div style={{ color: '#ef4444', marginTop: '15px', fontWeight: '500' }}>{mensagem}</div>}

        <p style={{ cursor: 'pointer', color: '#6366f1', marginTop: '25px', fontSize: '0.9rem' }} onClick={() => setIsRegistro(!isRegistro)}>
          {isRegistro ? 'Já possui acesso? Faça Login' : 'Solicitar novo acesso'}
        </p>
      </div>
    );
  }

  // ==========================================
  // 5. RENDERIZAÇÃO: DASHBOARD (2 Colunas)
  // ==========================================
  return (
    <div className="dashboard-container">
      
      {/* --- COLUNA ESQUERDA: Questionário --- */}
      <div className="conteudo-principal">
        <h1 className="titulo-neon">Auditoria Semanal de Aura</h1>
        
        <div className="painel-usuario">
          <h3 style={{ margin: 0, color: '#d1d5db' }}>
            Operador: <span style={{color: '#f9fafb'}}>{usuarioLogado}</span>
          </h3>
          <button className="btn-negativo" onClick={() => { 
            setUsuarioLogado(null); 
            setRespostas({}); 
            setMensagem(''); 
            setInputSenha(''); 
          }}>Sair do Sistema</button>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '10px' }}>
          {questionario.map((q, index) => (
            <div key={q.id} style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151' }}>
              <h4 style={{ margin: '0 0 20px 0', color: '#e5e7eb', fontSize: '1.1rem', lineHeight: '1.5' }}>
                {index + 1}. {q.pergunta}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.opcoes.map((opcao, i) => (
                  <label key={i} style={{ 
                    padding: '12px 15px', 
                    backgroundColor: respostas[q.id] === opcao.pontos ? '#4f46e5' : '#1f2937',
                    color: respostas[q.id] === opcao.pontos ? '#ffffff' : '#d1d5db',
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    border: '1px solid #4b5563',
                    transition: '0.2s ease'
                  }}>
                    <input 
                      type="radio" 
                      name={`pergunta-${q.id}`} 
                      value={opcao.pontos}
                      style={{ display: 'none' }}
                      onChange={() => selecionarOpcao(q.id, opcao.pontos)}
                    />
                    {opcao.texto}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button className="btn-epico" onClick={enviarQuestionario}>
            Processar Auditoria Semanal
          </button>
        </div>
        
        {mensagem && (
          <div style={{ color: '#10b981', marginTop: '20px', padding: '15px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '6px' }}>
            {mensagem}
          </div>
        )}
      </div>

      {/* --- COLUNA DIREITA: Ranking Fixo --- */}
      <div className="sidebar-ranking">
        <h2>Ranking de Classificação</h2>
        <ul className="ranking-lista">
          {ranking.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Nenhum dado auditado.</p>
          ) : (
            ranking.map((usuario, index) => (
              <li key={index} className="ranking-item">
                <span className="posicao">#{index + 1}</span>
                <span className="nome-jogador">{usuario.nome}</span>
                <span className={`aura-valor ${usuario.pontos >= 0 ? 'aura-positiva' : 'aura-negativa'}`}>
                  {usuario.pontos}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

    </div>
  );
}

export default App;