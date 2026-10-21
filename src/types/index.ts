export type SectionId = 'numerical' | 'verbal' | 'reasoning' | 'advanced' | 'coding';

export type QuestionType = 'mcq' | 'coding';

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  sectionId: SectionId;
  title: string;
  questionText: string;
  options?: QuestionOption[];
  correctOptionId?: string;
  explanation?: string;
  marks: number;
  negativeMarks?: number;
  // For coding questions
  starterTemplates?: Record<string, string>; // language -> starter code
  modelSolutions?: Record<string, string>; // language -> reference/write answer for admin
  sampleInput?: string;
  sampleExpectedOutput?: string;
  testCases?: Array<{ input: string; expected: string; hidden?: boolean }>;
  constraints?: string[];
  topic: string;
}

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_marked_for_review';

export interface StudentProfile {
  name: string;
  rollNo: string;
  branch: string;
  year: string;
  email: string;
  college: string;
  instructorEmail: string;
  googleSheetsWebhookUrl?: string;
}

export interface ProctorViolation {
  id: string;
  timestamp: string;
  type: 'tab_switch' | 'fullscreen_exit' | 'multiple_faces' | 'no_face' | 'audio_noise' | 'clipboard_blocked' | 'devtools_attempt';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface CodeEvaluationResult {
  score: number;
  maxScore: number;
  logicScore: number;
  verdict: string;
  approach: string;
  errorsIgnored: string[];
  feedback: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  testCases?: Array<{ input: string; expected: string; actual?: string; passed: boolean; note?: string }>;
}

export interface SubmissionRecord {
  id: string;
  createdAt: string;
  student: StudentProfile;
  totalScore: number;
  maxTotalScore: number;
  percentage: number;
  qualificationStatus: 'TCS Digital' | 'TCS Ninja' | 'Under Review' | 'Not Qualified';
  sectionScores: {
    numerical: { score: number; max: number; accuracy: number };
    verbal: { score: number; max: number; accuracy: number };
    reasoning: { score: number; max: number; accuracy: number };
    advanced: { score: number; max: number; accuracy: number };
    coding: { score: number; max: number; logicPercentage: number };
  };
  answers?: Record<string, string>;
  codingEvaluations: Record<string, CodeEvaluationResult>;
  codingSubmissions: Record<string, { language: string; code: string }>;
  integrityScore: number;
  violationCount: number;
  violations: ProctorViolation[];
  timeTakenMinutes: number;
}
