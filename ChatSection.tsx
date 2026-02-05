
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface Props {
  history: ChatMessage[];
  onSendMessage: (text: string) => void;
  hasContext: boolean;
  isTyping?: boolean;
}

const ChatSection: React.FC<Props> = ({ history, onSendMessage, hasContext, isTyping }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      {/* Header do Chat */}
      <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Consultor Estratégico</h2>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${hasContext ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></span>
              <p className="text-blue-100 text-[10px] uppercase font-bold tracking-widest">
                {hasContext ? 'IA Contextual Ativa' : 'Aguardando Análise'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-10">
            <div className="bg-white p-6 rounded-full shadow-lg border border-blue-50">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="max-w-md space-y-3">
              <h3 className="text-xl font-bold text-slate-800">Olá! Que bom ter você aqui.</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Estou pronto para mergulhar nos perfis com você. Podemos comparar candidatos, 
                explorar competências específicas ou até simular perguntas de entrevista. 
                <span className="block mt-2 font-semibold text-blue-600">Por onde quer começar nossa análise hoje?</span>
              </p>
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] px-6 py-4 shadow-sm leading-relaxed border ${
              msg.role === 'user' 
                ? 'bg-blue-50 text-blue-700 border-blue-200 rounded-3xl rounded-tr-none' 
                : 'bg-white text-blue-900 rounded-3xl rounded-tl-none border-l-4 border-blue-500 shadow-slate-200/50'
            }`}>
              <p className={`text-[13px] md:text-[14px] whitespace-pre-wrap ${
                msg.role === 'model' ? 'font-normal tracking-wide' : 'font-medium'
              }`}>
                {msg.text}
              </p>
            </div>
          </div>
        ))}

        {isTyping && history[history.length - 1]?.role !== 'model' && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none border shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[10px] text-blue-400 ml-1 font-bold uppercase tracking-tighter">Pensando estrategicamente...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input de Texto */}
      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input 
            type="text" 
            placeholder={isTyping ? "Aguardando minha resposta..." : "Pergunte algo ao seu parceiro de RH..."}
            disabled={isTyping}
            className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm text-blue-600 font-medium placeholder:text-slate-400 disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-90 disabled:bg-slate-300 disabled:shadow-none"
          >
            <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <p className="mt-3 text-[10px] text-center text-slate-400 font-medium uppercase tracking-widest">
          Sua consultoria privada de RH • Conversa Criptografada
        </p>
      </div>
    </div>
  );
};

export default ChatSection;
