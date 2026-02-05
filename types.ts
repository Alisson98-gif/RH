
export interface WeaknessAnalysis {
  issue: string;
  investigativeQuestion: string;
}

export interface ResumeAnalysis {
  candidateName: string;
  professionalSummary: string;
  technicalSkills: string[];
  softSkills: string[];
  relevantExperience: string;
  strengths: string[];
  weaknesses: WeaknessAnalysis[];
  adherencePercentage: number;
  recommendation: 'Aderente' | 'Parcial' | 'Pouco Aderente';
  justification: string;
  interviewQuestions: string[];
}

// Added the missing Resume interface required by components and services
export interface Resume {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'pdf' | 'image';
  analysis?: ResumeAnalysis;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum RecommendationType {
  ADHERENT = 'Aderente',
  PARTIAL = 'Parcial',
  LOW = 'Pouco Aderente'
}
