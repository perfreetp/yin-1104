export interface InstrumentType {
  id: string
  name: string
  category: string
  icon: string
  steps: ProcessStep[]
}

export interface ProcessStep {
  id: string
  title: string
  key: 'recycle' | 'clean' | 'pack' | 'sterilize' | 'release'
  description: string
  keyPoints: string[]
  duration: string
}

export interface SimulationForm {
  instrumentType: string
  batchNo: string
  recycleTime: string
  recycleOperator: string
  cleanMethod: string
  cleanOperator: string
  packOperator: string
  packDate: string
  sterilizerNo: string
  sterilizeTemp: string
  sterilizeTime: string
  sterilizeDuration: string
  releaseOperator: string
  releaseTime: string
  bioMonitor: string
}

export interface ValidationError {
  field: string
  label: string
  message: string
  suggestion: string
}

export interface Question {
  id: string
  type: 'single' | 'multiple' | 'judge' | 'scenario'
  question: string
  options: string[]
  answer: number | number[]
  explanation: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  forRoles: ('nurse' | 'disinfector')[]
}

export interface WrongQuestion extends Question {
  wrongCount: number
  correctCount: number
  lastWrongTime: string
  lastPracticeTime: string
  masteryLevel: 0 | 1 | 2 | 3 | 4 | 5
  mastered: boolean
}

export interface PracticeRecord {
  id: string
  questionId: string
  questionType: string
  category: string
  isCorrect: boolean
  timestamp: number
}

export interface ExamRecord {
  id: string
  date: string
  role: 'nurse' | 'disinfector'
  score: number
  totalQuestions: number
  correctCount: number
  duration: number
  pass: boolean
  wrongQuestionIds: string[]
  wrongCategories: string[]
}

export interface UserProfile {
  name: string
  role: 'nurse' | 'disinfector'
  avatar: string
  joinDate: string
  signedProcess: boolean
  signDate?: string
}

export interface TrainingTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed'
  deadline: string
  sourceCategory: string
  createdAt: string
}

export interface StatItem {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down'
}

export type TimelineItemType = 'sign' | 'exam' | 'practice' | 'training'

export interface TimelineItem {
  id: string
  type: TimelineItemType
  date: string
  timestamp: number
  title: string
  subtitle?: string
  detail: string
  examRecord?: ExamRecord
  trainingTask?: TrainingTask
  masteryChange?: number
}
