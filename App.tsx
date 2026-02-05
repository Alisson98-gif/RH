
import React, { useState, useEffect } from 'react';
import { Resume, ChatMessage } from './types';
import { analyzeResume, chatWithHRStream } from './services/geminiService';
import Header from './components/Header';
import JobDescriptionSection from './components/JobDescriptionSection';
import ResumeUploader from './components/ResumeUploader';
import AnalysisDashboard from './components/AnalysisDashboard';
import ChatSection from './components/ChatSection';

const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isChatting, setIsChatting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'analysis' | 'chat'>('setup');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [quotaError, setQuotaError] = useState<boolean>(false);

  const handleJobDescChange = (val: string) => setJobDescription(val);
  const handleAddResume = (newResume: Resume) => setResumes(prev => [...prev, newResume]);
  const handleRemoveResume = (id: string) => setResumes(prev => prev.filter(r => r.id !== id));

  // Limpa o erro de quota após 60 segundos automaticamente
  useEffect(() => {
    if (quotaError) {
      const timer = setTimeout(() => setQuotaError(false), 60000);
      return () => clearTimeout(timer);
    }
  }, [quotaError]);

  const runAnalysis = async () => {
    if (!jobDescription.trim() || resumes.length === 0) {
      alert("Preencha a descrição da vaga e adicione currículos.");
      return;
    }
    setIsAnalyzing(true);
    setQuotaError(false);
    setActiveTab('analysis');
    
    try {
      const updatedResumes = await Promise.all(
        resumes.map(async (res) => {
          if (res.analysis) return res;
          const analysis = await analyzeResume(jobDescription, res);
          return { ...res, analysis };
        })
      );
      setResumes(updatedResumes);
    } catch (error: any) {
      const msg = error?.message || "";
      if (msg.includes('429') || msg.includes('quota')) {
        setQuotaError(true);
        setActiveTab('setup');
      } else {
        alert("Ocorreu um erro inesperado na análise.");
        setActiveTab('setup');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', text };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatting(true);
    setQuotaError(false);

    const modelMsg: ChatMessage = { role: 'model', text: '' };
    setChatHistory(prev => [...prev, modelMsg]);

    try {
      let fullText = '';
      const stream = chatWithHRStream(jobDescription, resumes, text);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', text: fullText };
          return newHistory;
        });
      }
    } catch (error: any) {
      const msg = error?.message || "";
      if (msg.includes('429') || msg.includes('quota')) {
        setQuotaError(true);
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { 
            role: 'model', 
            text: "⚠️ **Limite de cota atingido.** Aguarde cerca de 1 minuto para que o Google libere novas requisições na versão gratuita." 
          };
          return newHistory;
        });
      } else {
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', text: "Ocorreu um erro na conexão." };
          return newHistory;
        });
      }
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      {quotaError && (
        <div className="bg-amber-500 text-white px-6 py-3 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top duration-300">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-wider">
            Cota Excedida: Aguarde 60 segundos para a próxima requisição (Limite do Google Gemini Free)
          </span>
        </div>
      )}

      <main className="flex-1 container mx-auto p-4 md:p-6 space-y-8 max-w-7xl">
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveTab('setup')} className={`px-6 py-3 font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'setup' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>1. Configuração</button>
          <button onClick={() => setActiveTab('analysis')} className={`px-6 py-3 font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'analysis' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>2. Análise Técnica</button>
          <button onClick={() => setActiveTab('chat')} className={`px-6 py-3 font-semibold text-sm transition-all whitespace-nowrap ${activeTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>3. Consultoria IA</button>
        </div>

        {activeTab === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
            <JobDescriptionSection value={jobDescription} onChange={handleJobDescChange} />
            <div className="space-y-6">
              <ResumeUploader onUpload={handleAddResume} resumes={resumes} onRemove={handleRemoveResume} />
              <button 
                onClick={runAnalysis} 
                disabled={isAnalyzing || quotaError || !jobDescription.trim() || resumes.length === 0} 
                className={`w-full py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98] ${
                  quotaError ? 'bg-amber-100 text-amber-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isAnalyzing ? "Gerando Insights..." : quotaError ? "Aguardando Resfriamento da Cota..." : "Iniciar Avaliação Pro"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && <AnalysisDashboard resumes={resumes} isLoading={isAnalyzing} />}
        {activeTab === 'chat' && <ChatSection history={chatHistory} onSendMessage={handleSendMessage} hasContext={resumes.some(r => !!r.analysis)} isTyping={isChatting} />}
      </main>
      <footer className="p-6 text-center text-xs text-slate-400 border-t bg-white">
        © 2025 RH AI Pro - Suporte Estratégico para Decisões de Recrutamento.
      </footer>
    </div>
  );
};

export default App;
