
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Resume, ResumeAnalysis, ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
Você é um Consultor de RH Sênior com 20 anos de experiência, atuando como um braço direito estratégico do usuário. 

DIRETRIZES DE PERSONALIDADE:
1. TONE OF VOICE: Use um tom caloroso, empático, inteligente e levemente entusiasmado. Você não é um software, você é um parceiro.
2. FLUIDEZ: Evite listas numeradas excessivas. Prefira parágrafos bem estruturados que "contam uma história" sobre os dados.
3. MARCADORES NATURAIS: Inicie frases com expressões como "Sabe, notei algo...", "Um ponto fascinante aqui é...", "Pensando estrategicamente na cultura da empresa...", "Fazendo um paralelo entre os candidatos...".
4. EMPATIA: Reconheça a complexidade de contratar. Use "nós" em vez de "eu" para criar um senso de equipe com o usuário.
5. PROATIVIDADE: Não responda apenas o que foi perguntado. Se notar um risco ou uma oportunidade em um currículo que o usuário não mencionou, traga isso à tona de forma diplomática.

REGRAS TÉCNICAS:
- Responda SEMPRE em PORTUGUÊS (Brasil).
- Se houver contexto de currículos analisados, cite nomes e exemplos específicos das experiências deles para validar seus pontos.
`;

const sanitizeJson = (text: string): string => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

/**
 * Função utilitária para executar chamadas de API com retry automático
 * em caso de erro de quota (429).
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || "";
      const isQuotaError = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests');
      
      if (isQuotaError && i < maxRetries - 1) {
        // Exponential backoff: 2s, 4s, 8s...
        const delay = Math.pow(2, i + 1) * 1000 + Math.random() * 1000;
        console.warn(`Quota excedida. Tentando novamente em ${Math.round(delay/1000)}s... (Tentativa ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const analyzeResume = async (
  jobDescription: string,
  resume: Resume
): Promise<ResumeAnalysis> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      CONTEXTO DA VAGA:
      ${jobDescription}

      CONTEÚDO DO CURRÍCULO:
      ${resume.type === 'text' ? resume.content : 'Conteúdo extraído de arquivo.'}

      OBJETIVO:
      Realize uma análise profunda de aderência e gere um ROTEIRO DE ENTREVISTA TÉCNICO.
      Retorne os dados exclusivamente em formato JSON seguindo o schema definido.
    `;

    const parts: any[] = [{ text: prompt }];
    if (resume.type === 'image' || resume.type === 'pdf') {
      parts.push({
        inlineData: {
          mimeType: resume.type === 'image' ? "image/jpeg" : "application/pdf",
          data: resume.content.split(',')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: "Você é um Headhunter de elite. Sua especialidade é detectar a verdade técnica por trás das experiências descritas nos currículos através de perguntas investigativas.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidateName: { type: Type.STRING },
            professionalSummary: { type: Type.STRING },
            technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            relevantExperience: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  issue: { type: Type.STRING },
                  investigativeQuestion: { type: Type.STRING }
                },
                required: ['issue', 'investigativeQuestion']
              } 
            },
            adherencePercentage: { type: Type.NUMBER },
            recommendation: { type: Type.STRING, enum: ['Aderente', 'Parcial', 'Pouco Aderente'] },
            justification: { type: Type.STRING },
            interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['candidateName', 'professionalSummary', 'technicalSkills', 'softSkills', 'relevantExperience', 'strengths', 'weaknesses', 'adherencePercentage', 'recommendation', 'justification', 'interviewQuestions']
        }
      }
    });

    return JSON.parse(sanitizeJson(response.text || "{}")) as ResumeAnalysis;
  });
};

export async function* chatWithHRStream(
  jobDescription: string,
  resumes: Resume[],
  newMessage: string
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const resumesContext = resumes.map(r => `
    - Candidato: ${r.analysis?.candidateName || r.name}. Aderência: ${r.analysis?.adherencePercentage}%. Gaps: ${r.analysis?.weaknesses.map(w => w.issue).join(', ')}.
  `).join('\n');

  const fullPrompt = `
    Contexto da Vaga: ${jobDescription}
    Candidatos Analisados:
    ${resumesContext}
    Pergunta do Usuário: ${newMessage}
  `;

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: SYSTEM_INSTRUCTION }
  });

  try {
    const responseStream = await chat.sendMessageStream({ message: fullPrompt });
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      yield c.text;
    }
  } catch (error: any) {
    const errorMessage = error?.message || "";
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      yield "⚠️ Desculpe, atingimos temporariamente o limite de uso da inteligência artificial. Por favor, aguarde cerca de 1 minuto e tente novamente.";
    } else {
      throw error;
    }
  }
}
