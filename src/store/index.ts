import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import {
  UserProfile,
  ExamRecord,
  WrongQuestion,
  PracticeRecord,
  TrainingTask,
  Question,
  TimelineItem
} from '@/types'
import { questions } from '@/data/questions'
import { userProfile as defaultUserProfile, examRecords as defaultExamRecords } from '@/data/user'

interface AppState {
  userProfile: UserProfile
  examRecords: ExamRecord[]
  wrongQuestions: WrongQuestion[]
  practiceRecords: PracticeRecord[]
  trainingTasks: TrainingTask[]

  signProcess: () => void
  addExamRecord: (record: ExamRecord) => void
  addPracticeRecord: (record: PracticeRecord, question: Question) => void
  markTaskCompleted: (taskId: string) => void
  removeWrongQuestion: (questionId: string) => void
  addCategoryToTraining: (category: string) => TrainingTask | null
  generateTrainingTasks: () => TrainingTask[]
  rebuildWrongQuestionsFromHistory: () => void
  getWeakPoints: () => string[]
  getStatistics: () => { totalExams: number; passRate: number; avgScore: number }
  getRoleExamQuestions: (role: 'nurse' | 'disinfector', count: number) => Question[]
  getCategoryPracticeQuestions: (category: string, count: number) => Question[]
  getReadinessScore: () => {
    total: number
    items: { key: string; label: string; score: number; max: number; done: boolean }[]
  }
  getQuestionMastery: (questionId: string) => number
  getTimeline: () => TimelineItem[]
}

const WEAK_POINT_MAP: Record<string, string> = {
  '回收': '器械回收规范与初步处理',
  '清洗': '清洗质量控制与方法选择',
  '包装': '包装材料选择与封口规范',
  '灭菌': '灭菌参数记忆与设备操作',
  '放行': '放行标准与质量监测',
  '临床交接': '临床交接与患者沟通',
  '其他': '岗位职责与基础知识'
}

const TASK_TEMPLATE_MAP: Record<string, { title: string; description: string }> = {
  '回收': {
    title: '器械回收规范强化训练',
    description: '学习使用后器械的初步处理方法、分类回收原则和回收记录填写要求'
  },
  '清洗': {
    title: '清洗质量控制专项练习',
    description: '掌握手工清洗和机械清洗的适用场景，清洗质量检查要点'
  },
  '包装': {
    title: '包装规范与封口技术',
    description: '熟悉纸塑袋、棉布等包装材料的使用，封口宽度和包装标识规范'
  },
  '灭菌': {
    title: '灭菌参数与设备操作',
    description: '牢记各类灭菌程序的温度、时间、压力参数，掌握设备操作流程'
  },
  '放行': {
    title: '放行标准与质量监测',
    description: '学习物理监测、化学监测、生物监测的判读标准和放行原则'
  },
  '临床交接': {
    title: '临床交接流程与沟通',
    description: '掌握无菌物品交接、存放管理和使用前检查规范'
  },
  '其他': {
    title: '岗位职责与基础知识',
    description: '学习消毒员/护士的岗位职责、职业防护和院感基础知识'
  }
}

const MASTERY_THRESHOLD = 3

const taroStorage = {
  getItem: (name: string) => {
    try {
      return Taro.getStorageSync(name)
    } catch (e) {
      console.error('[Storage] getItem error:', name, e)
      return null
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value)
    } catch (e) {
      console.error('[Storage] setItem error:', name, e)
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name)
    } catch (e) {
      console.error('[Storage] removeItem error:', name, e)
    }
  }
}

const calcMasteryLevel = (correctCount: number, wrongCount: number): 0 | 1 | 2 | 3 | 4 | 5 => {
  const diff = correctCount - wrongCount
  if (diff >= MASTERY_THRESHOLD * 2) return 5
  if (diff >= MASTERY_THRESHOLD) return 4
  if (diff >= 1) return 3
  if (diff >= 0) return 2
  if (wrongCount <= 1) return 1
  return 0
}

const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const buildWrongQuestionsFromHistory = (
  examRecords: ExamRecord[],
  practiceRecords: PracticeRecord[]
): WrongQuestion[] => {
  const counter: Record<string, { wrongCount: number; correctCount: number; lastWrong: string; lastPractice: string }> = {}

  const today = new Date().toISOString().split('T')[0]

  examRecords.forEach(record => {
    record.wrongQuestionIds.forEach(qId => {
      if (!counter[qId]) {
        counter[qId] = { wrongCount: 0, correctCount: 0, lastWrong: '', lastPractice: '' }
      }
      counter[qId].wrongCount += 1
      counter[qId].lastWrong = record.date
    })
  })

  practiceRecords.forEach(rec => {
    const qId = rec.questionId
    const date = new Date(rec.timestamp).toISOString().split('T')[0]
    if (!rec.isCorrect) {
      if (!counter[qId]) {
        counter[qId] = { wrongCount: 0, correctCount: 0, lastWrong: '', lastPractice: '' }
      }
      counter[qId].wrongCount += 1
      counter[qId].lastWrong = date
      counter[qId].lastPractice = date
    } else {
      if (counter[qId]) {
        counter[qId].correctCount += 1
        counter[qId].lastPractice = date
      }
    }
  })

  const result: WrongQuestion[] = []
  Object.entries(counter).forEach(([qId, c]) => {
    if (c.wrongCount <= 0) return
    const question = questions.find(q => q.id === qId)
    if (!question) return
    const mastery = calcMasteryLevel(c.correctCount, c.wrongCount)
    result.push({
      ...question,
      wrongCount: c.wrongCount,
      correctCount: c.correctCount,
      lastWrongTime: c.lastWrong || today,
      lastPracticeTime: c.lastPractice,
      masteryLevel: mastery,
      mastered: c.correctCount >= MASTERY_THRESHOLD && mastery >= 4
    })
  })

  return result.sort((a, b) => b.wrongCount - a.wrongCount)
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userProfile: defaultUserProfile,
      examRecords: defaultExamRecords,
      wrongQuestions: buildWrongQuestionsFromHistory(defaultExamRecords, []),
      practiceRecords: [],
      trainingTasks: [],

      signProcess: () => {
        const today = new Date().toISOString().split('T')[0]
        set(state => ({
          userProfile: {
            ...state.userProfile,
            signedProcess: true,
            signDate: today
          }
        }))
      },

      addExamRecord: (record: ExamRecord) => {
        set(state => {
          const allRecords = [record, ...state.examRecords]
          const newWrong = buildWrongQuestionsFromHistory(allRecords, state.practiceRecords)

          const today = new Date().toISOString().split('T')[0]
          const recentRecords = allRecords.slice(0, 10)
          const categoryCount: Record<string, number> = {}
          recentRecords.forEach(r => {
            r.wrongCategories.forEach(cat => {
              categoryCount[cat] = (categoryCount[cat] || 0) + 1
            })
          })

          const sortedCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .map(([cat]) => cat)

          const existingTaskCategories = new Set(
            state.trainingTasks
              .filter(t => t.status === 'pending')
              .map(t => t.sourceCategory)
          )

          const newTasks: TrainingTask[] = sortedCategories
            .filter(cat => !existingTaskCategories.has(cat))
            .slice(0, 3)
            .map((cat, i) => {
              const template = TASK_TEMPLATE_MAP[cat] || TASK_TEMPLATE_MAP['其他']
              return {
                id: `t_${Date.now()}_${i}`,
                title: template.title,
                description: template.description,
                status: 'pending' as const,
                deadline: addDays(today, 7),
                sourceCategory: cat,
                createdAt: today
              }
            })

          return {
            examRecords: allRecords,
            wrongQuestions: newWrong,
            trainingTasks: [...newTasks, ...state.trainingTasks]
          }
        })
      },

      addPracticeRecord: (record: PracticeRecord, question: Question) => {
        set(state => {
          const newPracticeRecords = [record, ...state.practiceRecords]
          const newWrong = buildWrongQuestionsFromHistory(state.examRecords, newPracticeRecords)
          return {
            practiceRecords: newPracticeRecords,
            wrongQuestions: newWrong
          }
        })
      },

      markTaskCompleted: (taskId: string) => {
        const today = new Date().toISOString().split('T')[0]
        set(state => ({
          trainingTasks: state.trainingTasks.map(t =>
            t.id === taskId ? { ...t, status: 'completed' as const, completedAt: today } : t
          )
        }))
      },

      removeWrongQuestion: (questionId: string) => {
        set(state => ({
          wrongQuestions: state.wrongQuestions.filter(wq => wq.id !== questionId)
        }))
      },

      addCategoryToTraining: (category: string): TrainingTask | null => {
        const state = get()
        const existing = state.trainingTasks.find(
          t => t.sourceCategory === category && t.status === 'pending'
        )
        if (existing) return null

        const template = TASK_TEMPLATE_MAP[category] || TASK_TEMPLATE_MAP['其他']
        const today = new Date().toISOString().split('T')[0]
        const task: TrainingTask = {
          id: `manual_${Date.now()}`,
          title: template.title,
          description: template.description,
          status: 'pending',
          deadline: addDays(today, 7),
          sourceCategory: category,
          createdAt: today
        }

        set(s => ({
          trainingTasks: [task, ...s.trainingTasks]
        }))

        return task
      },

      generateTrainingTasks: () => {
        const state = get()
        const recentRecords = state.examRecords.slice(0, 5)
        const categoryCount: Record<string, number> = {}
        const today = new Date().toISOString().split('T')[0]

        recentRecords.forEach(r => {
          r.wrongCategories.forEach(cat => {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1
          })
        })

        state.wrongQuestions
          .filter(wq => !wq.mastered)
          .sort((a, b) => b.wrongCount - a.wrongCount)
          .slice(0, 10)
          .forEach(wq => {
            categoryCount[wq.category] = (categoryCount[wq.category] || 0) + wq.wrongCount
          })

        const sortedCategories = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .map(([cat]) => cat)

        const existingCategories = new Set(state.trainingTasks.map(t => t.sourceCategory))
        const newTasks: TrainingTask[] = sortedCategories
          .filter(cat => !existingCategories.has(cat))
          .slice(0, 3)
          .map((cat, i) => {
            const template = TASK_TEMPLATE_MAP[cat] || TASK_TEMPLATE_MAP['其他']
            return {
              id: `auto_${Date.now()}_${i}`,
              title: template.title,
              description: template.description,
              status: 'pending' as const,
              deadline: addDays(today, 7),
              sourceCategory: cat,
              createdAt: today
            }
          })

        if (newTasks.length > 0) {
          set(state => ({
            trainingTasks: [...newTasks, ...state.trainingTasks]
          }))
        }

        return [...newTasks, ...state.trainingTasks]
      },

      rebuildWrongQuestionsFromHistory: () => {
        const state = get()
        const newWrong = buildWrongQuestionsFromHistory(state.examRecords, state.practiceRecords)
        set({ wrongQuestions: newWrong })
      },

      getWeakPoints: () => {
        const state = get()
        const categoryCount: Record<string, number> = {}

        state.wrongQuestions
          .filter(wq => !wq.mastered)
          .forEach(wq => {
            categoryCount[wq.category] = (categoryCount[wq.category] || 0) + wq.wrongCount
          })

        state.examRecords.slice(0, 5).forEach(r => {
          r.wrongCategories.forEach(cat => {
            categoryCount[cat] = (categoryCount[cat] || 0) + 1
          })
        })

        return Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([cat]) => WEAK_POINT_MAP[cat] || cat)
      },

      getStatistics: () => {
        const records = get().examRecords
        const totalExams = records.length
        if (totalExams === 0) {
          return { totalExams: 0, passRate: 0, avgScore: 0 }
        }
        const passCount = records.filter(r => r.pass).length
        const passRate = Math.round((passCount / totalExams) * 100)
        const avgScore = Math.round(records.reduce((sum, r) => sum + r.score, 0) / totalExams)
        return { totalExams, passRate, avgScore }
      },

      getRoleExamQuestions: (role: 'nurse' | 'disinfector', count: number) => {
        const nursePriority = ['回收', '放行', '临床交接']
        const disinfectorPriority = ['清洗', '包装', '灭菌', '其他']
        const priorityCategories = role === 'nurse' ? nursePriority : disinfectorPriority
        const otherCategories = role === 'nurse' ? disinfectorPriority : nursePriority

        const roleQuestions = questions.filter(q => q.forRoles.includes(role))
        const priorityQuestions = roleQuestions.filter(q => priorityCategories.includes(q.category))
        const otherQuestions = roleQuestions.filter(q => otherCategories.includes(q.category))

        const priorityCount = Math.ceil(count * 0.7)
        const otherCount = count - priorityCount

        const shuffledPriority = [...priorityQuestions].sort(() => Math.random() - 0.5)
        const shuffledOther = [...otherQuestions].sort(() => Math.random() - 0.5)

        const selected: Question[] = []
        const wrongQIds = get().wrongQuestions.filter(wq => !wq.mastered).map(wq => wq.id)

        const priorityWrong = shuffledPriority.filter(q => wrongQIds.includes(q.id))
        const priorityNormal = shuffledPriority.filter(q => !wrongQIds.includes(q.id))
        selected.push(...priorityWrong.slice(0, Math.floor(priorityCount * 0.6)))
        selected.push(...priorityNormal.slice(0, priorityCount - selected.length))

        while (selected.length < priorityCount && priorityNormal.length > 0) {
          const idx = Math.floor(Math.random() * priorityNormal.length)
          selected.push(priorityNormal.splice(idx, 1)[0])
        }

        const otherWrong = shuffledOther.filter(q => wrongQIds.includes(q.id))
        const otherNormal = shuffledOther.filter(q => !wrongQIds.includes(q.id))
        selected.push(...otherWrong.slice(0, Math.floor(otherCount * 0.5)))

        while (selected.length < count) {
          if (otherNormal.length > 0) {
            const idx = Math.floor(Math.random() * otherNormal.length)
            selected.push(otherNormal.splice(idx, 1)[0])
          } else if (shuffledPriority.length > selected.length) {
            const available = shuffledPriority.filter(q => !selected.find(s => s.id === q.id))
            if (available.length > 0) {
              const idx = Math.floor(Math.random() * available.length)
              selected.push(available[idx])
            } else {
              break
            }
          } else {
            break
          }
        }

        return selected.sort(() => Math.random() - 0.5)
      },

      getCategoryPracticeQuestions: (category: string, count: number) => {
        const categoryQuestions = questions.filter(q => q.category === category)
        const wrong = get().wrongQuestions
        const unmasteredIds = wrong.filter(wq => !wq.mastered && wq.category === category).map(wq => wq.id)

        const wrongQ = categoryQuestions.filter(q => unmasteredIds.includes(q.id))
        const normalQ = categoryQuestions.filter(q => !unmasteredIds.includes(q.id))

        const result: Question[] = []
        result.push(...wrongQ.sort(() => Math.random() - 0.5).slice(0, Math.ceil(count * 0.7)))
        result.push(...normalQ.sort(() => Math.random() - 0.5))
        return result.slice(0, count)
      },

      getReadinessScore: () => {
        const state = get()
        const items: { key: string; label: string; score: number; max: number; done: boolean }[] = []

        const signed = state.userProfile.signedProcess ? 1 : 0
        items.push({
          key: 'sign',
          label: '流程签署',
          score: signed ? 25 : 0,
          max: 25,
          done: state.userProfile.signedProcess
        })

        const hasRecentPass = state.examRecords.length > 0
          ? state.examRecords.slice(0, 3).filter(r => r.pass).length >= 2
          : false
        const examScore = hasRecentPass ? 25 : state.examRecords.length > 0 ? 10 : 0
        items.push({
          key: 'exam',
          label: '考核通过',
          score: examScore,
          max: 25,
          done: hasRecentPass
        })

        const unmasteredCount = state.wrongQuestions.filter(wq => !wq.mastered).length
        const totalWrong = state.wrongQuestions.length
        const practiceScore = totalWrong > 0
          ? Math.max(0, Math.round(((totalWrong - unmasteredCount) / totalWrong) * 25))
          : 0
        items.push({
          key: 'practice',
          label: '错题掌握',
          score: practiceScore,
          max: 25,
          done: totalWrong > 0 && unmasteredCount === 0
        })

        const pendingTasks = state.trainingTasks.filter(t => t.status === 'pending').length
        const hasTasks = state.trainingTasks.length > 0
        const taskScore = hasTasks
          ? (pendingTasks === 0 ? 25 : Math.max(0, Math.round(25 * (state.trainingTasks.length - pendingTasks) / state.trainingTasks.length)))
          : 0
        items.push({
          key: 'task',
          label: '补训任务',
          score: taskScore,
          max: 25,
          done: hasTasks && pendingTasks === 0
        })

        const total = items.reduce((sum, item) => sum + item.score, 0)

        return { total, items }
      },

      getQuestionMastery: (questionId: string) => {
        const wq = get().wrongQuestions.find(q => q.id === questionId)
        if (!wq) return 0
        return wq.masteryLevel
      },

      getTimeline: () => {
        const state = get()
        const result: TimelineItem[] = []

        if (state.userProfile.signedProcess && state.userProfile.signDate) {
          const ts = new Date(state.userProfile.signDate + 'T10:00:00').getTime()
          result.push({
            id: `sign_${ts}`,
            type: 'sign',
            date: state.userProfile.signDate,
            timestamp: ts,
            title: '流程确认书签署',
            detail: `已签署上岗流程确认书，确认掌握消毒追溯规范`
          })
        }

        state.examRecords.forEach(record => {
          const ts = new Date(record.date + 'T10:00:00').getTime()
          const roleName = record.role === 'nurse' ? '护士' : '消毒员'
          const passText = record.pass ? '通过' : '未通过'
          const cats = record.wrongCategories.length > 0
            ? `薄弱环节：${record.wrongCategories.join('、')}`
            : '全部掌握'
          result.push({
            id: record.id,
            type: 'exam',
            date: record.date,
            timestamp: ts,
            title: `${roleName}考核 · ${passText}`,
            subtitle: `${record.score}分 · ${record.correctCount}/${record.totalQuestions}题`,
            detail: cats,
            examRecord: record
          })
        })

        const dailyPracticeMap: Record<string, { total: number; correct: number; categories: Set<string> }> = {}
        state.practiceRecords.forEach(rec => {
          const date = new Date(rec.timestamp).toISOString().split('T')[0]
          if (!dailyPracticeMap[date]) {
            dailyPracticeMap[date] = { total: 0, correct: 0, categories: new Set() }
          }
          dailyPracticeMap[date].total += 1
          if (rec.isCorrect) dailyPracticeMap[date].correct += 1
          dailyPracticeMap[date].categories.add(rec.category)
        })

        Object.entries(dailyPracticeMap).forEach(([date, data]) => {
          const rate = Math.round((data.correct / data.total) * 100)
          const cats = Array.from(data.categories).join('、')
          result.push({
            id: `practice_${date}`,
            type: 'practice',
            date,
            timestamp: new Date(date + 'T15:00:00').getTime(),
            title: '错题纠偏练习',
            subtitle: `${data.correct}/${data.total}题正确 · 正确率${rate}%`,
            detail: `练习分类：${cats || '综合'}`,
            masteryChange: rate
          })
        })

        state.trainingTasks.forEach(task => {
          if (task.status === 'completed') {
            const dateStr = task.completedAt || task.createdAt
            const ts = new Date(dateStr + 'T14:00:00').getTime()
            result.push({
              id: task.id,
              type: 'training',
              date: dateStr,
              timestamp: ts,
              title: `补训完成：${task.title}`,
              subtitle: `来源分类：${task.sourceCategory}`,
              detail: task.description,
              trainingTask: task
            })
          }
        })

        return result.sort((a, b) => b.timestamp - a.timestamp)
      }
    }),
    {
      name: 'disinfection-training-storage',
      storage: createJSONStorage(() => taroStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[Store] Rehydrate error:', error)
        } else if (state) {
          console.log('[Store] Rehydrated, rebuilding wrong questions...')
          state.rebuildWrongQuestionsFromHistory()
        }
      }
    }
  )
)
