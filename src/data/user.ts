import { UserProfile, ExamRecord } from '@/types'

export const userProfile: UserProfile = {
  name: '李小明',
  role: 'disinfector',
  avatar: 'https://picsum.photos/id/1005/200/200',
  joinDate: '2024-01-02',
  signedProcess: false
}

export const examRecords: ExamRecord[] = [
  {
    id: 'e1',
    date: '2024-01-17',
    role: 'disinfector',
    score: 90,
    totalQuestions: 10,
    correctCount: 9,
    duration: 480,
    pass: true,
    wrongQuestionIds: ['q2'],
    wrongCategories: ['灭菌']
  },
  {
    id: 'e2',
    date: '2024-01-16',
    role: 'disinfector',
    score: 70,
    totalQuestions: 10,
    correctCount: 7,
    duration: 520,
    pass: false,
    wrongQuestionIds: ['q5', 'q6', 'q9'],
    wrongCategories: ['包装', '灭菌', '清洗']
  },
  {
    id: 'e3',
    date: '2024-01-15',
    role: 'disinfector',
    score: 85,
    totalQuestions: 10,
    correctCount: 8.5,
    duration: 450,
    pass: true,
    wrongQuestionIds: ['q11', 'q12'],
    wrongCategories: ['灭菌', '放行']
  },
  {
    id: 'e4',
    date: '2024-01-14',
    role: 'disinfector',
    score: 65,
    totalQuestions: 10,
    correctCount: 6.5,
    duration: 600,
    pass: false,
    wrongQuestionIds: ['q2', 'q5', 'q6', 'q9', 'q11'],
    wrongCategories: ['灭菌', '包装', '灭菌', '清洗', '灭菌']
  },
  {
    id: 'e5',
    date: '2024-01-13',
    role: 'disinfector',
    score: 80,
    totalQuestions: 10,
    correctCount: 8,
    duration: 500,
    pass: true,
    wrongQuestionIds: ['q2', 'q12'],
    wrongCategories: ['灭菌', '放行']
  }
]
