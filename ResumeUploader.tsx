
import React, { useState } from 'react';
import { Resume } from '../types';
import mammoth from 'mammoth';

interface Props {
  resumes: Resume[];
  onUpload: (res: Resume) => void;
  onRemove: (id: string) => void;
}

const ResumeUploader: React.FC<Props> = ({ resumes, onUpload, onRemove }) => {
  const [uploadType, setUploadType] = useState<'file' | 'text'>('file');
  const [tempText, setTempText] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'pdf') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          onUpload({
            id: crypto.randomUUID(),
            name: fileName,
            content: base64,
            type: 'pdf'
          });
        };
        reader.readAsDataURL(file);
      } else if (extension === 'docx' || extension === 'doc') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        onUpload({
          id: crypto.randomUUID(),
          name: fileName,
          content: result.value,
          type: 'text'
        });
      } else if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          onUpload({
            id: crypto.randomUUID(),
            name: fileName,
            content: base64,
            type: 'image'
          });
        };
        reader.readAsDataURL(file);
      } else {
        alert("Formato não suportado. Use PDF, DOCX ou Imagens.");
      }
    } catch (err) {
      console.error("Erro ao processar arquivo:", err);
      alert("Erro ao ler o arquivo.");
    } finally {
      setIsProcessing(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleAddText = () => {
    if (!tempText.trim() || !candidateName.trim()) {
      alert("Preencha o nome do candidato e o conteúdo do currículo.");
      return;
    }
    onUpload({
      id: crypto.randomUUID(),
      name: candidateName,
      content: tempText,
      type: 'text'
    });
    setTempText('');
    setCandidateName('');
  };

  const getIcon = (type: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (type === 'pdf') return '📕';
    if (ext === 'docx' || ext === 'doc') return '📄';
    if (type === 'image') return '🖼️';
    return '📝';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-50 p-2 rounded-md">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Currículos ({resumes.length})</h2>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setUploadType('file')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${uploadType === 'file' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          >
            Upload Arquivo
          </button>
          <button 
            onClick={() => setUploadType('text')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${uploadType === 'text' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          >
            Colar Texto
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {uploadType === 'text' ? (
          <div className="space-y-3">
            <input 
              type="text"
              placeholder="Nome do Candidato"
              className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
            <textarea
              placeholder="Cole o conteúdo do currículo aqui..."
              className="w-full p-3 text-sm border rounded-lg h-32 resize-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 outline-none"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
            />
            <button 
              onClick={handleAddText}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Adicionar via Texto
            </button>
          </div>
        ) : (
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative ${isProcessing ? 'bg-gray-50 border-gray-300 cursor-wait' : 'hover:border-indigo-400 border-gray-200 cursor-pointer'}`}>
            {!isProcessing ? (
              <>
                <input 
                  type="file" 
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleFileUpload}
                />
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Arraste ou clique para enviar</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, Imagens (Máx 10MB)</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-600">Processando arquivo...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {resumes.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-4 italic">Nenhum currículo adicionado.</p>
        )}
        {resumes.map((res) => (
          <div key={res.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg group animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white rounded shadow-sm border text-xl">
                {getIcon(res.type, res.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{res.name}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                  {res.type === 'pdf' ? 'Documento PDF' : res.type === 'image' ? 'Arquivo de Imagem' : 'Conteúdo de Texto'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onRemove(res.id)}
              className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeUploader;
