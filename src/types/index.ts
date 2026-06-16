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
  cleanMethod: string
  packOperator: string
  sterilizerNo: string
  sterilizeTemp: string
  sterilizeTime: string
  releaseOperator: string
  releaseTime: string
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
}

export interface WrongQuestion extends Question {
  wrongCount: number
  lastWrongTime: string
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
}

export interface UserProfile {
  name: string
  role: 'nurse' | 'disinfector'
  avatar: string
  joinDate: string
  totalExams: number
  passRate: number
  avgScore: number
  weakPoints: string[]
  trainingTasks: TrainingTask[]
  signedProcess: boolean
  signDate?: string
}

export interface TrainingTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed'
  deadline: string
}

export interface StatItem {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down'
}
