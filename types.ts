export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AnalysisResult {
  code: string;
  explanation?: string;
}

export interface TokenBlock {
  color_palette: Record<string, string>;
  typography: Record<string, string>;
  animation_constants: Record<string, string>;
}