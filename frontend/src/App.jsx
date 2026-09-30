import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  // ==========================================
  // 1. ESTADOS (Variáveis da Tela)
  // ==========================================
  const [ranking, setRanking] = useState([]);
  const [mensagem, setMensagem] = useState('');
  
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [inputUsuario, setInputUsuario] = useState('');
  const [inputSenha, setInputSenha] = useState('');
  const [isRegistro, setIsRegistro] = useState(false);
  const [telaAtual, setTelaAtual] = useState('dashboard'); 
  
  const [questionario, setQuestionario] = useState([]);
  const [respostas, setRespostas] = useState({});

  // ==========================================
  // 2. COMUNICAÇÃO COM A API
  // ==========================================
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
    try {
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
          setTelaAtual('dashboard');
          setMensagem('');
        }
      } else { setMensagem(dados.erro); }
    } catch (error) { setMensagem("Erro de conexão."); }
  };

  // ==========================================
  // 3. MECÂNICA DE AURA, PROGRESSO E EXPORTAÇÃO
  // ==========================================
  const selecionarOpcao = (idPergunta, pontos) => {
    setRespostas({ ...respostas, [idPergunta]: pontos });
  };

  const enviarQuestionario = async () => {
    if (Object.keys(respostas).length < questionario.length) {
      setMensagem("Auditoria incompleta: Responda a todas as perguntas!");
      return;
    }
    const totalPontos = Object.values(respostas).reduce((acc, pontos) => acc + pontos, 0);
    
    try {
      const resposta = await fetch('http://localhost:3000/calcular-semana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioLogado, totalPontos })
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setMensagem(dados.mensagem);
        carregarDadosBase(); 
      } else {
        setMensagem(dados.erro); 
      }
    } catch (error) { setMensagem("Erro ao enviar dados."); }
  };

  // Função para exportar a div como Imagem PNG
  const exportarCartao = async () => {
    const elemento = document.getElementById('cartao-aura');
    if (!elemento) return;
    
    try {
      const canvas = await html2canvas(elemento, { 
        backgroundColor: '#111827', // Mantém o fundo escuro do cartão
        scale: 2 // Dobra a resolução para a imagem ficar com qualidade alta
      });
      
      const imagem = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imagem;
      link.download = `AuraID_${usuarioLogado}.png`;
      link.click();
    } catch (error) {
      console.error("Erro ao gerar imagem", error);
    }
  };

  const calcularProgresso = () => {
    if (questionario.length === 0) return 0;
    return Math.round((Object.keys(respostas).length / questionario.length) * 100);
  };
  const progresso = calcularProgresso();
  const jaRespondeu = ranking.some(user => user.nome === usuarioLogado);

  const dadosMeuUsuario = ranking.find(user => user.nome === usuarioLogado);
  const minhaAura = dadosMeuUsuario ? dadosMeuUsuario.pontos : 0;

  const obterClasseAura = (pontos) => {
    if (!jaRespondeu) return { titulo: "Desconhecido", cor: "#9ca3af" };
    if (pontos < 0) return { titulo: "NPC / Hater", cor: "#f87171" }; 
    if (pontos <= 2000) return { titulo: "Normie", cor: "#9ca3af" }; 
    if (pontos <= 4000) return { titulo: "Sigma", cor: "#34d399" }; 
    return { titulo: "Stand User", cor: "#c084fc" }; 
  };
  
  // Calcula atributos no formato de status de Stand (A, B, C, D, E, S)
  const obterAtributos = (pontos) => {
    if (!jaRespondeu) return { suporte: '?', internet: '?', defesa: '?' };
    if (pontos < 0) return { suporte: 'E', internet: 'D', defesa: 'E' };
    if (pontos <= 2000) return { suporte: 'C', internet: 'C', defesa: 'C' };
    if (pontos <= 4000) return { suporte: 'A', internet: 'B', defesa: 'A' };
    return { suporte: 'S', internet: 'S', defesa: 'S' };
  };

  const minhaClasse = obterClasseAura(minhaAura);
  const meusAtributos = obterAtributos(minhaAura);

  // ==========================================
  // 4. RENDERIZAÇÃO: TELA DE LOGIN
  // ==========================================
  if (!usuarioLogado) {
    return (
      <div className="caixa-brutalista login-container">
        <h1 className="titulo-brutal">Aura System</h1>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 'bold' }}>
          {isRegistro ? 'Criar Conta' : 'Acesso ao Painel'}
        </h2>
        <form className="form-login" onSubmit={autenticar}>
          <input type="text" placeholder="Nome de Usuário" className="input-nome" value={inputUsuario} onChange={(e) => setInputUsuario(e.target.value)} required />
          <input type="password" placeholder="Senha Secreta" className="input-nome" value={inputSenha} onChange={(e) => setInputSenha(e.target.value)} required />
          <button type="submit" className="btn-epico">{isRegistro ? 'Registrar' : 'Entrar'}</button>
        </form>
        {mensagem && <div style={{ color: '#000', backgroundColor: '#f87171', padding: '10px', border: '3px solid #000', borderRadius: '8px', marginTop: '15px', fontWeight: '900' }}>{mensagem}</div>}
        <p style={{ cursor: 'pointer', color: '#9CA3AF', marginTop: '25px', fontWeight: 'bold', textDecoration: 'underline' }} onClick={() => setIsRegistro(!isRegistro)}>
          {isRegistro ? 'Já tem acesso? Faça Login' : 'Criar nova conta!'}
        </p>
      </div>
    );
  }

  // ==========================================
  // 5. RENDERIZAÇÃO: PERFIL DO OPERADOR
  // ==========================================
  if (telaAtual === 'perfil') {
    return (
      <div className="caixa-brutalista" style={{ maxWidth: '800px', margin: '3rem auto', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="titulo-brutal" style={{ margin: 0, border: 'none', padding: 0 }}>ID do Operador</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-epico" style={{ width: 'auto', padding: '10px 15px', fontSize: '0.9rem' }} onClick={exportarCartao}>Exportar Cartão</button>
            <button className="btn-negativo" style={{ padding: '10px 15px', fontSize: '0.9rem' }} onClick={() => setTelaAtual('dashboard')}>Voltar ao Painel</button>
          </div>
        </div>

        {/* Div com ID para o html2canvas capturar perfeitamente */}
        <div id="cartao-aura" style={{ backgroundColor: '#111827', border: `3px solid ${minhaClasse.cor}`, padding: '30px', borderRadius: '12px', boxShadow: `4px 4px 0px ${minhaClasse.cor}`, marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #312e81', paddingBottom: '20px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', margin: '0 0 10px 0', color: '#ffffff' }}>{usuarioLogado}</h2>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '1.1rem', fontWeight: 'bold' }}>Classe Registrada:</p>
              <h3 style={{ margin: 0, color: minhaClasse.cor, fontSize: '1.5rem', textTransform: 'uppercase' }}>{minhaClasse.titulo}</h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '1.1rem', fontWeight: 'bold' }}>Aura Total:</p>
              <h1 style={{ margin: 0, fontSize: '3.5rem', color: minhaClasse.cor }}>{jaRespondeu ? minhaAura : '???'}</h1>
            </div>
          </div>

          {/* Status de Atributos */}
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontWeight: 'bold', fontSize: '0.9rem' }}>QI de Internet</p>
              <span style={{ fontSize: '1.8rem', color: '#ffffff', fontWeight: '900' }}>{meusAtributos.internet}</span>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontWeight: 'bold', fontSize: '0.9rem' }}>Resiliência de TI</p>
              <span style={{ fontSize: '1.8rem', color: '#ffffff', fontWeight: '900' }}>{meusAtributos.suporte}</span>
            </div>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontWeight: 'bold', fontSize: '0.9rem' }}>Defesa Anti-Cringe</p>
              <span style={{ fontSize: '1.8rem', color: '#ffffff', fontWeight: '900' }}>{meusAtributos.defesa}</span>
            </div>
          </div>
        </div>

        {/* Galeria de Conquistas */}
        <h2 style={{ color: '#c7d2fe', borderBottom: '3px solid #312e81', paddingBottom: '10px' }}>Conquistas Desbloqueadas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          
          <div style={{ backgroundColor: '#111827', border: '3px solid #000', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🌐</div>
            <h4 style={{ margin: '0 0 5px 0', color: '#e2e8f0' }}>Acesso Concedido</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Criou uma conta no sistema.</p>
          </div>

          <div style={{ backgroundColor: '#111827', border: '3px solid #000', padding: '15px', borderRadius: '8px', textAlign: 'center', opacity: jaRespondeu ? 1 : 0.4 }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
            <h4 style={{ margin: '0 0 5px 0', color: '#e2e8f0' }}>Primeira Auditoria</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Calculou a aura pela primeira vez.</p>
          </div>

          <div style={{ backgroundColor: '#111827', border: '3px solid #000', padding: '15px', borderRadius: '8px', textAlign: 'center', opacity: minhaAura > 4000 ? 1 : 0.4 }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⭐</div>
            <h4 style={{ margin: '0 0 5px 0', color: '#e2e8f0' }}>Stand User</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Atingiu o rank máximo do sistema.</p>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // 6. RENDERIZAÇÃO: DASHBOARD
  // ==========================================
  return (
    <div className="dashboard-container">
      <div className="caixa-brutalista">
        <h1 className="titulo-brutal">Auditoria Semanal</h1>
        
        <div className="painel-usuario">
          <h3 style={{ margin: 0 }}>Operador: <span style={{color: '#c7d2fe'}}>{usuarioLogado}</span></h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-epico" style={{ width: 'auto', padding: '10px 15px', fontSize: '0.9rem' }} onClick={() => setTelaAtual('perfil')}>Ver Perfil</button>
            <button className="btn-negativo" style={{ padding: '10px 15px', fontSize: '0.9rem' }} onClick={() => { setUsuarioLogado(null); setRespostas({}); setMensagem(''); setInputSenha(''); }}>Sair</button>
          </div>
        </div>

        {jaRespondeu ? (
          <div style={{ backgroundColor: '#111827', border: '3px solid #000', padding: '40px 20px', borderRadius: '8px', textAlign: 'center', boxShadow: '4px 4px 0px #000' }}>
            <h2 style={{ color: '#34d399', fontSize: '1.8rem', marginBottom: '10px' }}>✓ Auditoria Concluída</h2>
            <p style={{ color: '#9ca3af', fontSize: '1.1rem', lineHeight: '1.5' }}>
              Seus dados de Aura já foram processados nesta semana.<br/>
              O terminal está bloqueado até a próxima rodada de avaliação.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'left', marginBottom: '10px' }}>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#9ca3af' }}>Progresso dos Dados</span>
                <span style={{ fontWeight: 'bold', color: '#0d9488' }}>{progresso}%</span>
              </div>
              <div style={{ backgroundColor: '#111827', border: '3px solid #000', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
                <div style={{ width: `${progresso}%`, backgroundColor: '#0d9488', height: '100%', borderRight: progresso > 0 ? '3px solid #000' : 'none', transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}></div>
              </div>
            </div>

            {questionario.map((q, index) => (
              <div key={q.id} style={{ marginBottom: '35px' }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '900' }}>{index + 1}. {q.pergunta}</h4>
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
        )}
        
        {mensagem && !jaRespondeu && (
          <div style={{ color: '#000', marginTop: '20px', padding: '15px', backgroundColor: '#f87171', border: '3px solid #000', borderRadius: '8px', fontWeight: 'bold', boxShadow: '4px 4px 0px #000' }}>
            {mensagem}
          </div>
        )}
      </div>

      <div className="caixa-brutalista sidebar-ranking">
        <h2 style={{ borderBottom: '3px solid #312e81', paddingBottom: '10px', marginTop: 0, fontWeight: '900', color: '#c7d2fe' }}>Ranking Global</h2>
        <ul className="ranking-lista">
          {ranking.length === 0 ? (
            <p style={{ fontWeight: 'bold', color: '#9CA3AF' }}>Nenhum dado auditado.</p>
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