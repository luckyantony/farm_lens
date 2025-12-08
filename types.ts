export interface AnalysisResult {
  isValidPlant: boolean;
  isBlurry: boolean;
  issue: string;
  explanation: string;
  remedies: string[];
  prevention: string[];
  forecast: string;
  impactStats: string;
  disclaimer: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum Language {
  ENGLISH = 'English',
  SWAHILI = 'Swahili',
}

export interface PlantContext {
  notes: string;
  language: Language;
}