import { UserProfile, ExamRecord } from '@/types'

export const userProfile: UserProfile = {
  name: '李小明',
  role: 'disinfector',
  avatar: 'https://picsum.photos/id/1005/200/200',
  joinDate: '2024-01-02',
  totalExams: 12,
  passRate: 75,
  avgScore: 82,
  weakPoints: ['灭菌参数记忆', '生物监测频率', '批次中断处理', '包内缺件处理'],
  trainingTasks: [
    {
      id: 't1',
      title: '灭菌参数强化训练',
      description: '复习各类器械的灭菌温度、时间、压力参数',
      status: 'pending',
      deadline: '2024-01-20'
    },
    {
      id: 't2',
      title: '情景题专项练习',
      description: '包内缺件、批次中断等异常情况处理',
      status: 'pending',
      deadline: '2024-01-22'
    },
    {
      id: 't3',
      title: '追溯单填写规范',
      description: '模拟录入练习，确保填写零差错',
      status: 'completed',
      deadline: '2024-01-10'
    }
  ],
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
    pass: true
  },
  {
    id: 'e2',
    date: '2024-01-16',
    role: 'disinfector',
    score: 70,
    totalQuestions: 10,
    correctCount: 7,
    duration: 520,
    pass: false
  },
  {
    id: 'e3',
    date: '2024-01-15',
    role: 'disinfector',
    score: 85,
    totalQuestions: 10,
    correctCount: 8.5,
    duration: 450,
    pass: true
  },
  {
    id: 'e4',
    date: '2024-01-14',
    role: 'disinfector',
    score: 65,
    totalQuestions: 10,
    correctCount: 6.5,
    duration: 600,
    pass: false
  },
  {
    id: 'e5',
    date: '2024-01-13',
    role: 'disinfector',
    score: 80,
    totalQuestions: 10,
    correctCount: 8,
    duration: 500,
    pass: true
  }
]
