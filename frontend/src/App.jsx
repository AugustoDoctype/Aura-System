import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [ranking, setRanking] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputSenha, setInputSenha] = useState('');
  const [isRegistro, setIsRegistro] = useState(false);
  const [questionario, setQuestionario] = useState([]);
  const [respostas, setRespostas] = useState({});

  const carregarDadosBase = async () => {
    try {
      const resRanking = await fetch('http://localhost:3000/ranking');
      setRanking(await resRanking.json());

      const resQuestoes = await fetch('http://localhost:3000/questionario');
      setQuestionario(await resQuestoes.json());
    } catch (error) {
      setMensagem("Erro ao conectar com o servidor.");
    }
  };

  useEffect(() => { carregarDadosBase(); }, []);

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
    } else { setMensagem(dados.erro); }
  };

  const selecionarOpcao = (idPergunta, pontos) => {
    setRespostas({ ...respostas, [idPergunta]: pontos });
  };

  const enviarQuestionario = async () => {
    if (Object.keys(respostas).length < questionario.length) {
      setMensagem("Auditoria incompleta: Responda todas as perguntas!");
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

  // TELA DE LOGIN
  if (!usuarioLogado) {
    return (
      <div className="caixa-brutalista tema-verde-agua login-container">
        <h1 className="titulo-brutal">Aura System</h1>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 'bold' }}>
          {isRegistro ? 'Criar Conta' : 'Acesso ao Painel'}
        </h2>
        <form className="form-login" onSubmit={autenticar}>
          <input type="text" placeholder="Nome de Usuário" className="input-nome" value={inputUsuario} onChange={(e) => setInputUsuario(e.target.value)} required />
          <input type="password" placeholder="Senha Secreta" className="input-nome" value={inputSenha} onChange={(e) => setInputSenha(e.target.value)} required />
          <button type="submit" className="btn-epico">{isRegistro ? 'Registrar' : 'Entrar'}</button>
        </form>
        {mensagem && <div style={{ color: '#000', backgroundColor: '#fff', padding: '10px', border: '4px solid #000', marginTop: '15px', fontWeight: '900' }}>{mensagem}</div>}
        <p style={{ cursor: 'pointer', color: '#fff', marginTop: '25px', fontWeight: 'bold', textDecoration: 'underline' }} onClick={() => setIsRegistro(!isRegistro)}>
          {isRegistro ? 'Já possui acesso? Faça Login' : 'Criar nova conta!'}
        </p>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="dashboard-container">
      {/* ESQUERDA: Questionário (Verde Água Escuro) */}
      <div className="caixa-brutalista tema-verde-agua">
        <h1 className="titulo-brutal">Auditoria Semanal</h1>
        <div className="painel-usuario">
          <h3 style={{ margin: 0 }}>Operador: <span style={{color: '#9CA3AF'}}>{usuarioLogado}</span></h3>
          <button className="btn-negativo" onClick={() => { setUsuarioLogado(null); setRespostas({}); setMensagem(''); setInputSenha(''); }}>Sair</button>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '10px' }}>
          {questionario.map((q, index) => (
            <div key={q.id} style={{ marginBottom: '35px' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '900' }}>
                {index + 1}. {q.pergunta}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {q.opcoes.map((opcao, i) => (
                  <label key={i} className={respostas[q.id] === opcao.pontos ? 'opcao-selecionada' : 'opcao-normal'}>
                    <input type="radio" name={`pergunta-${q.id}`} value={opcao.pontos} style={{ display: 'none' }} onChange={() => selecionarOpcao(q.id, opcao.pontos)} />
                    {opcao.texto}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button className="btn-epico" onClick={enviarQuestionario}>Calcular Aura!</button>
        </div>
        
        {mensagem && (
          <div style={{ color: '#000', marginTop: '20px', padding: '15px', backgroundColor: '#fff', border: '4px solid #000', fontWeight: 'bold', boxShadow: '4px 4px 0px #000' }}>
            {mensagem}
          </div>
        )}
      </div>

      {/* DIREITA: Ranking (Roxo Escuro) */}
      <div className="caixa-brutalista tema-roxo-escuro sidebar-ranking">
        <h2 style={{ borderBottom: '4px solid #000', paddingBottom: '10px', marginTop: 0, fontWeight: '900' }}>Ranking Global</h2>
        <ul className="ranking-lista">
          {ranking.length === 0 ? (
            <p style={{ fontWeight: 'bold', color: '#fff' }}>Nenhum dado auditado.</p>
          ) : (
            ranking.map((usuario, index) => (
              <li key={index} className="ranking-item">
                <span style={{ fontSize: '1.2rem' }}>#{index + 1}</span>
                <span style={{ flexGrow: 1, paddingLeft: '10px' }}>{usuario.nome}</span>
                <span className={usuario.pontos >= 0 ? 'aura-positiva' : 'aura-negativa'}>{usuario.pontos}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;