
import React, { useState } from 'react';
import { Resume } from '../types';

interface Props {
  resumes: Resume[];
  isLoading: boolean;
}

const AnalysisDashboard: React.FC<Props> = ({ resumes, isLoading }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const analyzedResumes = resumes
    .filter(r => !!r.analysis)
    .sort((a, b) => (b.analysis?.adherencePercentage || 0) - (a.analysis?.adherencePercentage || 0));

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 3) {
        alert("A visualização comparativa detalhada é limitada a 3 candidatos por vez.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedResumes = analyzedResumes.filter(r => selectedIds.includes(r.id));
  
  // Cálculos comparativos para destaques visuais
  const maxAdherence = Math.max(...selectedResumes.map(r => r.analysis?.adherencePercentage || 0));
  const minAdherence = Math.min(...selectedResumes.map(r => r.analysis?.adherencePercentage || 0));
  const hasDisparity = maxAdherence - minAdherence > 15;

  const exportFullReport = async () => {
    const element = document.getElementById('full-printable-report');
    if (!element) return;

    setIsExporting(true);
    element.classList.remove('hidden');
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Relatorio_Executivo_RH_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // @ts-ignore
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert("Houve um erro ao gerar o PDF.");
    } finally {
      element.classList.add('hidden');
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-600">O Especialista de RH está analisando os perfis...</p>
      </div>
    );
  }

  if (analyzedResumes.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Nenhuma análise processada</h3>
        <p className="text-gray-500 mt-2">Configure a vaga e adicione currículos na aba anterior para ver os resultados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header e Ações */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {showComparison ? 'Comparativo de Candidatos' : 'Dashboard de Triagem'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={exportFullReport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all disabled:opacity-50 shadow-sm"
          >
            {isExporting ? (
              <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            Relatório Consolidado (PDF)
          </button>

          {showComparison && (
            <button 
              onClick={() => setShowComparison(false)}
              className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo da Aba */}
      {showComparison ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          {hasDisparity && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4">
              <div className="bg-amber-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Disparidade Técnica Identificada</p>
                <p className="text-xs text-amber-600">Existe uma diferença de mais de {maxAdherence - minAdherence}% entre o primeiro e o último candidato selecionado.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedResumes.map((res) => {
              const isTop = res.analysis?.adherencePercentage === maxAdherence;
              const isBottom = res.analysis?.adherencePercentage === minAdherence && selectedResumes.length > 1;
              
              return (
                <div key={res.id} className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm flex flex-col transition-all ${isTop ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100'}`}>
                  <div className={`p-6 text-center border-b relative ${isTop ? 'bg-blue-50/50' : 'bg-slate-50'}`}>
                    {isTop && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 shadow-lg animate-bounce">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Líder Técnico
                      </div>
                    )}
                    
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg ${isTop ? 'bg-blue-600 shadow-blue-200' : 'bg-slate-200'}`}>
                      <span className={`text-2xl font-black ${isTop ? 'text-white' : 'text-slate-500'}`}>
                        {res.analysis?.candidateName[0]}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 truncate px-4">{res.analysis?.candidateName}</h3>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className={`text-2xl font-black ${isTop ? 'text-blue-600' : 'text-slate-600'}`}>{res.analysis?.adherencePercentage}%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Aderência</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 flex-1">
                    {/* Experiência - Destaque Visual */}
                    <div className={`p-4 rounded-2xl border-l-4 ${isTop ? 'bg-blue-50 border-blue-500' : 'bg-slate-50 border-slate-300'}`}>
                      <h4 className={`text-[10px] font-black uppercase mb-2 ${isTop ? 'text-blue-700' : 'text-slate-500'}`}>Experiência Relevante</h4>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {res.analysis?.relevantExperience}
                      </p>
                    </div>

                    {/* Pontos Fortes - Destaque Visual */}
                    <div>
                      <h4 className="text-[10px] font-black text-green-600 uppercase mb-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Pontos de Destaque
                      </h4>
                      <ul className="space-y-2">
                        {res.analysis?.strengths.map((s, i) => (
                          <li key={i} className={`text-[11px] flex gap-2 p-2 rounded-lg transition-colors ${isTop ? 'bg-green-50/50 text-green-800' : 'text-slate-600'}`}>
                            <span className="text-green-500 font-bold">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pontos de Atenção - Destaque Visual com ícones de disparidade */}
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-amber-600 uppercase mb-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Gaps & Validação (Pontos de Atenção)
                      </h4>
                      <ul className="space-y-4">
                        {res.analysis?.weaknesses.map((w, i) => (
                          <li key={i} className={`text-[11px] p-3 rounded-lg border-l-2 ${isBottom ? 'bg-red-50 text-red-700 border-red-300' : 'bg-amber-50 border-amber-300 text-amber-900'}`}>
                            <div className="flex gap-2 items-start">
                                <span className={isBottom ? 'text-red-500 font-bold' : 'text-amber-500 font-bold'}>!</span>
                                <div>
                                    <p className="font-bold mb-1">{w.issue}</p>
                                    <p className="text-[10px] italic opacity-80 leading-snug">Pergunta Investigativa: "{w.investigativeQuestion}"</p>
                                </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Roteiro Estratégico */}
                    <div className={`p-4 rounded-2xl text-white shadow-lg ${isTop ? 'bg-blue-600' : 'bg-slate-800'}`}>
                      <h4 className="text-[10px] font-black text-white/60 uppercase mb-3">Roteiro Sugerido (Geral)</h4>
                      <div className="space-y-3">
                        {res.analysis?.interviewQuestions.slice(0, 2).map((q, i) => (
                          <p key={i} className="text-[11px] leading-snug font-medium italic opacity-100">
                            "{q}"
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Ranking Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Ranking de Candidatos
              </h3>
              {selectedIds.length > 0 && (
                <button 
                  onClick={() => setShowComparison(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition-all animate-pulse"
                >
                  Ver Comparativo Lado a Lado ({selectedIds.length}/3)
                </button>
              )}
            </div>
            <table className="w-full text-left">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Posição</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidato</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Avaliação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {analyzedResumes.map((res, idx) => (
                  <tr 
                    key={res.id} 
                    className={`transition-colors cursor-pointer group ${selectedIds.includes(res.id) ? 'bg-blue-50/40' : 'hover:bg-slate-50/80'}`} 
                    onClick={() => handleSelect(res.id)}
                  >
                    <td className="px-6 py-4">
                      <div className={`w-5 h-5 rounded border-2 transition-all ${selectedIds.includes(res.id) ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-100' : 'border-slate-200'}`}>
                        {selectedIds.includes(res.id) && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-400">{idx + 1}º</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{res.analysis?.candidateName}</p>
                      <p className="text-[10px] text-slate-400">{res.name}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-blue-600">{res.analysis?.adherencePercentage}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                        res.analysis?.recommendation === 'Aderente' ? 'bg-green-100 text-green-700' :
                        res.analysis?.recommendation === 'Parcial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {res.analysis?.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Individual Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {analyzedResumes.map((res) => (
              <div key={res.id} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{res.analysis?.candidateName}</h3>
                    <p className="text-xs text-slate-400 mt-1">{res.analysis?.professionalSummary.slice(0, 100)}...</p>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-2xl text-center border border-blue-100">
                    <span className="block text-xl font-black text-blue-600">{res.analysis?.adherencePercentage}%</span>
                    <span className="text-[9px] font-black text-blue-400 uppercase">Match</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase">Habilidades</h4>
                    <div className="flex flex-wrap gap-1">
                      {res.analysis?.technicalSkills.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase">Gaps Identificados</h4>
                    <ul className="text-[10px] text-amber-700 space-y-1">
                      {res.analysis?.weaknesses.slice(0, 2).map((w, i) => (
                        <li key={i}>• {w.issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl text-white">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2">Pergunta de Validação Sugerida</h4>
                  <p className="text-[11px] italic opacity-90 leading-relaxed font-medium">"{res.analysis?.weaknesses[0]?.investigativeQuestion || res.analysis?.interviewQuestions[0]}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ELEMENTO OCULTO PARA EXPORTAÇÃO (FORMATADO PARA PDF A4 PORTRAIT) */}
      <div id="full-printable-report" className="hidden p-10 bg-white text-slate-900 font-sans">
        <div className="flex justify-between items-center border-b-2 border-blue-600 pb-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Relatório Executivo de Triagem</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Inteligência Artificial de Recrutamento & Seleção</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase">Data do Relatório</p>
            <p className="text-lg font-black text-blue-600">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 1. Sumário do Ranking */}
        <section className="mb-12">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
            1. Ranking Geral de Candidatos
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="p-4 border border-slate-200 text-xs font-black uppercase text-slate-500">Posição</th>
                <th className="p-4 border border-slate-200 text-xs font-black uppercase text-slate-500">Candidato</th>
                <th className="p-4 border border-slate-200 text-xs font-black uppercase text-slate-500 text-center">Score Técnico</th>
                <th className="p-4 border border-slate-200 text-xs font-black uppercase text-slate-500 text-right">Avaliação IA</th>
              </tr>
            </thead>
            <tbody>
              {analyzedResumes.map((res, idx) => (
                <tr key={res.id}>
                  <td className="p-4 border border-slate-200 font-black text-slate-400">{idx + 1}º</td>
                  <td className="p-4 border border-slate-200">
                    <p className="font-bold text-slate-900">{res.analysis?.candidateName}</p>
                  </td>
                  <td className="p-4 border border-slate-200 text-center font-black text-blue-600">{res.analysis?.adherencePercentage}%</td>
                  <td className="p-4 border border-slate-200 text-right">
                    <span className="text-[10px] font-black uppercase text-slate-600">{res.analysis?.recommendation}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 2. Fichas Individuais Detalhadas */}
        <section className="page-break-before">
          <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
            2. Dossiê Individual e Gaps Investigativos
          </h2>
          <div className="space-y-12">
            {analyzedResumes.map((res) => (
              <div key={res.id} className="border-l-4 border-blue-600 pl-8 space-y-6 avoid-page-break">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{res.analysis?.candidateName}</h3>
                    <p className="text-slate-400 font-bold text-sm uppercase">{res.analysis?.recommendation} • {res.analysis?.adherencePercentage}% Aderência</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-black text-blue-600 uppercase text-[10px] mb-1">Resumo do Perfil</h4>
                      <p className="text-slate-700 leading-relaxed text-xs">{res.analysis?.professionalSummary}</p>
                    </div>
                    <div>
                      <h4 className="font-black text-green-600 uppercase text-[10px] mb-1">Pontos Fortes</h4>
                      <ul className="text-xs space-y-1 text-slate-600">
                        {res.analysis?.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-black text-slate-900 uppercase text-[10px] mb-1">Justificativa da Recomendação</h4>
                      <p className="text-slate-700 leading-relaxed text-xs">{res.analysis?.justification}</p>
                    </div>
                    <div>
                      <h4 className="font-black text-amber-600 uppercase text-[10px] mb-1">Pontos de Atenção & Investigação</h4>
                      <ul className="text-xs space-y-4 text-slate-600">
                        {res.analysis?.weaknesses.map((w, i) => (
                          <li key={i} className="border-b border-slate-100 pb-2">
                            <p className="font-bold text-slate-900">• {w.issue}</p>
                            <p className="italic text-slate-500 mt-1">Sugestão: "{w.investigativeQuestion}"</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h4 className="font-black text-slate-900 uppercase text-[10px] mb-4">Guia Estratégico de Entrevista (Geral)</h4>
                  <div className="space-y-3">
                    {res.analysis?.interviewQuestions.map((q, i) => (
                      <div key={i} className="flex gap-3 text-xs italic text-slate-600 leading-snug">
                        <span className="font-black text-blue-400">{i+1}.</span>
                        <p>"{q}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-20 border-t pt-6 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Gerado automaticamente por RH AI Analyst Pro • 2025 • Confidencial
          </p>
        </footer>
      </div>

      <style>{`
        .page-break-before { page-break-before: always; }
        .avoid-page-break { page-break-inside: avoid; }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .animate-pulse {
          animation: pulse-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AnalysisDashboard;
