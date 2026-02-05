
import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const JobDescriptionSection: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-50 p-2 rounded-md">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Descrição da Vaga</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">Insira os requisitos técnicos, competências e responsabilidades do cargo para a análise comparativa.</p>
      <textarea
        className="flex-1 w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 text-gray-700 min-h-[300px]"
        placeholder="Ex: Desenvolvedor Full Stack Sênior. Requisitos: React, Node.js, Inglês Fluente..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default JobDescriptionSection;
