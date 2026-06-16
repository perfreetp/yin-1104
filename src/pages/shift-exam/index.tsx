import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import { Question, ExamRecord, PracticeRecord } from '@/types';
import { useAppStore } from '@/store';

type RoleType = 'nurse' | 'disinfector';
type ExamStatus = 'idle' | 'exam' | 'result' | 'practice';

const ShiftExamPage: React.FC = () => {
  const [role, setRole] = useState<RoleType>('disinfector');
  const [examStatus, setExamStatus] = useState<ExamStatus>('idle');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [timer, setTimer] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const [showQuestionDetail, setShowQuestionDetail] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'wrong'>('all');

  const [practiceCategory, setPracticeCategory] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getRoleExamQuestions = useAppStore(s => s.getRoleExamQuestions);
  const getCategoryPracticeQuestions = useAppStore(s => s.getCategoryPracticeQuestions);
  const addExamRecord = useAppStore(s => s.addExamRecord);
  const addPracticeRecord = useAppStore(s => s.addPracticeRecord);
  const addCategoryToTraining = useAppStore(s => s.addCategoryToTraining);

  const roleName: Record<RoleType, string> = {
    nurse: '护士',
    disinfector: '消毒员'
  };

  const roleDesc: Record<RoleType, string> = {
    nurse: '侧重回收、放行与临床交接',
    disinfector: '侧重清洗、包装、灭菌与监测'
  };

  const examCount = 10;
  const passScore = 80;
  const practiceCount = 5;

  const startExam = () => {
    const questions = getRoleExamQuestions(role, examCount);
    beginSession(questions);
    setExamStatus('exam');
  };

  const beginSession = (questions: Question[]) => {
    console.log('[Session] Start with', questions.length, 'questions');
    setExamQuestions(questions);
    setCurrentIndex(0);
    setAnswers({});
    setTimer(0);
    setHasSaved(false);
    setFilterMode('all');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const startPractice = (category: string) => {
    const questions = getCategoryPracticeQuestions(category, practiceCount);
    if (questions.length === 0) {
      Taro.showToast({ title: '该分类暂无题目', icon: 'none' });
      return;
    }
    setPracticeCategory(category);
    beginSession(questions);
    setExamStatus('practice');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSelectAnswer = (answerIndex: number) => {
    const currentQ = examQuestions[currentIndex];
    if (currentQ.type === 'multiple') {
      const currentAnswers = (answers[currentIndex] as number[]) || [];
      if (currentAnswers.includes(answerIndex)) {
        setAnswers(prev => ({
          ...prev,
          [currentIndex]: currentAnswers.filter(a => a !== answerIndex)
        }));
      } else {
        setAnswers(prev => ({
          ...prev,
          [currentIndex]: [...currentAnswers, answerIndex]
        }));
      }
    } else {
      setAnswers(prev => ({
        ...prev,
        [currentIndex]: answerIndex
      }));
    }
  };

  const isAnswerCorrect = (q: Question, userAnswer: number | number[] | undefined): boolean => {
    if (userAnswer === undefined) return false;
    if (Array.isArray(q.answer)) {
      if (!Array.isArray(userAnswer)) return false;
      return userAnswer.length === q.answer.length &&
        userAnswer.every(a => q.answer.includes(a));
    } else {
      return userAnswer === q.answer;
    }
  };

  const correctCount = useMemo(() => {
    let count = 0;
    examQuestions.forEach((q, index) => {
      if (isAnswerCorrect(q, answers[index])) count++;
    });
    return count;
  }, [examQuestions, answers]);

  const score = useMemo(() => {
    if (examQuestions.length === 0) return 0;
    return Math.round((correctCount / examQuestions.length) * 100);
  }, [correctCount, examQuestions.length]);

  const isPass = score >= passScore;
  const answeredCount = Object.keys(answers).length;
  const wrongQuestions = examQuestions.filter(
    (q, idx) => !isAnswerCorrect(q, answers[idx])
  );
  const wrongCategories = useMemo(() => {
    const cats = new Set(wrongQuestions.map(q => q.category));
    return Array.from(cats);
  }, [wrongQuestions]);

  const submitPractice = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    examQuestions.forEach((q, idx) => {
      const correct = isAnswerCorrect(q, answers[idx]);
      const record: PracticeRecord = {
        id: `practice_${Date.now()}_${idx}`,
        questionId: q.id,
        questionType: q.type,
        category: q.category,
        isCorrect: correct,
        timestamp: Date.now() + idx
      };
      addPracticeRecord(record, q);
    });

    setHasSaved(true);
    setExamStatus('result');
  };

  const submitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!hasSaved) {
      const wrongIds: string[] = [];
      const wrongCats: string[] = [];
      examQuestions.forEach((q, index) => {
        if (!isAnswerCorrect(q, answers[index])) {
          wrongIds.push(q.id);
          if (!wrongCats.includes(q.category)) {
            wrongCats.push(q.category);
          }
        }
      });

      const record: ExamRecord = {
        id: `exam_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        role,
        score,
        totalQuestions: examQuestions.length,
        correctCount,
        duration: timer,
        pass: isPass,
        wrongQuestionIds: wrongIds,
        wrongCategories: wrongCats
      };

      console.log('[Exam] Saving record:', record);
      addExamRecord(record);
      setHasSaved(true);
    }

    setExamStatus('result');
  };

  const handleSubmit = () => {
    if (examStatus === 'practice') {
      submitPractice();
    } else {
      submitExam();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < examQuestions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const restartExam = () => {
    setExamStatus('idle');
    setExamQuestions([]);
    setAnswers({});
    setPracticeCategory('');
  };

  const handleAddToTraining = (category: string) => {
    const task = addCategoryToTraining(category);
    if (task) {
      Taro.showToast({ title: '已加入补训', icon: 'success' });
    } else {
      Taro.showToast({ title: '已在补训计划中', icon: 'none' });
    }
  };

  const displayQuestions = useMemo(() => {
    if (filterMode === 'wrong') {
      return examQuestions
        .map((q, idx) => ({ q, idx }))
        .filter(({ q, idx }) => !isAnswerCorrect(q, answers[idx]))
        .map(({ q, idx }) => ({ question: q, originalIndex: idx }));
    }
    return examQuestions.map((q, idx) => ({ question: q, originalIndex: idx }));
  }, [examQuestions, answers, filterMode]);

  const currentDetailQuestion = showQuestionDetail !== null
    ? examQuestions[showQuestionDetail]
    : null;

  const sessionTitle = examStatus === 'practice'
    ? `${practiceCategory}专项练习`
    : `${roleName[role]}考核`;

  const canSubmit = () => {
    if (examStatus === 'practice') {
      return Object.keys(answers).length > 0;
    }
    return answeredCount > 0;
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>班次考核</Text>
        <Text className={styles.headerDesc}>上岗前快速考核，确保操作规范</Text>
      </View>

      {examStatus === 'idle' && (
        <ScrollView scrollY>
          <View className={styles.roleSelector}>
            <View
              className={classnames(styles.roleCard, role === 'nurse' && styles.active)}
              onClick={() => setRole('nurse')}
            >
              <Text className={styles.roleIcon}>👩‍⚕️</Text>
              <Text className={styles.roleName}>护士</Text>
              <Text className={styles.roleDesc}>侧重回收与放行</Text>
            </View>
            <View
              className={classnames(styles.roleCard, role === 'disinfector' && styles.active)}
              onClick={() => setRole('disinfector')}
            >
              <Text className={styles.roleIcon}>🧑‍🔧</Text>
              <Text className={styles.roleName}>消毒员</Text>
              <Text className={styles.roleDesc}>侧重灭菌与监测</Text>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.infoCards}>
              <View className={styles.infoCard}>
                <Text className={styles.infoValue}>{examCount}</Text>
                <Text className={styles.infoLabel}>题目数量</Text>
              </View>
              <View className={styles.infoCard}>
                <Text className={styles.infoValue}>{passScore}分</Text>
                <Text className={styles.infoLabel}>及格分数</Text>
              </View>
              <View className={styles.infoCard}>
                <Text className={styles.infoValue}>10分钟</Text>
                <Text className={styles.infoLabel}>建议用时</Text>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.startExamCard}>
              <Text className={styles.startExamIcon}>📝</Text>
              <Text className={styles.startExamTitle}>{roleName[role]}考核</Text>
              <Text className={styles.startExamDesc}>
                {roleDesc[role]}，共{examCount}道题目
              </Text>
              <View className={styles.startExamBtn} onClick={startExam}>
                <Text>开始考试</Text>
              </View>
              <View className={styles.examTips}>
                <Text className={styles.tipsText}>
                  💡 提示：系统将根据你的角色智能出题，重点考察岗位职责相关内容
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {(examStatus === 'exam' || examStatus === 'practice') && examQuestions.length > 0 && (
        <>
          <View className={styles.section}>
            <View className={styles.examCard}>
              <View className={styles.examHeader}>
                <View className={styles.examInfo}>
                  <Text>{sessionTitle} · 第 {currentIndex + 1} / {examQuestions.length} 题</Text>
                </View>
                <Text className={styles.timer}>⏱️ {formatTime(timer)}</Text>
              </View>
              <View className={styles.progressSection}>
                <ProgressBar current={answeredCount} total={examQuestions.length} label="答题进度" />
              </View>
            </View>
          </View>

          <ScrollView className={styles.section} scrollY>
            <QuestionCard
              question={examQuestions[currentIndex]}
              showAnswer={false}
              selectedAnswer={answers[currentIndex]}
              onSelect={handleSelectAnswer}
              showIndex={currentIndex + 1}
            />
          </ScrollView>

          <View className={styles.bottomBar}>
            <View
              className={classnames(styles.btn, styles.btnOutline, currentIndex === 0 && styles.btnDisabled)}
              onClick={handlePrev}
            >
              <Text>上一题</Text>
            </View>
            {currentIndex < examQuestions.length - 1 ? (
              <View className={classnames(styles.btn, styles.btnPrimary)} onClick={handleNext}>
                <Text>下一题</Text>
              </View>
            ) : (
              <View
                className={classnames(styles.btn, styles.btnPrimary, !canSubmit() && styles.btnDisabled)}
                onClick={handleSubmit}
              >
                <Text>{examStatus === 'practice' ? '提交练习' : '提交答卷'}</Text>
              </View>
            )}
          </View>
        </>
      )}

      {examStatus === 'result' && (
        <View className={styles.resultPage}>
          <View className={classnames(styles.resultHeader, !isPass && examStatus !== 'practice' && styles.fail, examStatus === 'practice' && styles.practice)}>
            <Text className={styles.resultScore}>{score}分</Text>
            <Text className={styles.resultLabel}>
              {practiceCategory
                ? `${practiceCategory}专项练习 · 正确${correctCount}/${examQuestions.length}题`
                : (isPass ? '🎉 考核通过，可以上岗' : '💪 继续努力，加油')}
            </Text>
          </View>

          <View className={styles.resultStatsRow}>
            <View className={styles.resultStat}>
              <Text className={styles.resultStatValue}>{correctCount}</Text>
              <Text className={styles.resultStatLabel}>答对</Text>
            </View>
            <View className={styles.resultStat}>
              <Text className={styles.resultStatValue}>{examQuestions.length - correctCount}</Text>
              <Text className={styles.resultStatLabel}>答错</Text>
            </View>
            <View className={styles.resultStat}>
              <Text className={styles.resultStatValue}>{formatTime(timer)}</Text>
              <Text className={styles.resultStatLabel}>用时</Text>
            </View>
          </View>

          {wrongQuestions.length > 0 && (
            <View className={styles.section}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>
                  <Text className={styles.sectionTitleIcon}>📌</Text>
                  薄弱环节 · 专项再练
                </Text>
              </View>
              <View className={styles.weakCategories}>
                {wrongCategories.map(cat => (
                  <View key={cat} className={styles.weakCategoryItem}>
                    <View style={{ flex: 1 }}>
                      <Text className={styles.weakCategoryName}>{cat}</Text>
                      <Text className={styles.weakCategoryCount}>
                        {wrongQuestions.filter(q => q.category === cat).length}道错题
                      </Text>
                    </View>
                    <View style={{ display: 'flex', gap: '12rpx' }}>
                      <View
                        className={styles.addTrainingBtn}
                        onClick={() => handleAddToTraining(cat)}
                      >
                        <Text>补训</Text>
                      </View>
                      <View
                        className={classnames(styles.addTrainingBtn, styles.practiceBtn)}
                        onClick={() => startPractice(cat)}
                      >
                        <Text>再练5题</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.sectionTitleIcon}>📋</Text>
                {examStatus === 'practice' ? '练习详情' : '考试详情'}
              </Text>
              <View className={styles.filterTabs}>
                <View
                  className={classnames(styles.filterTab, filterMode === 'all' && styles.active)}
                  onClick={() => setFilterMode('all')}
                >
                  <Text>全部</Text>
                </View>
                <View
                  className={classnames(styles.filterTab, filterMode === 'wrong' && styles.active)}
                  onClick={() => setFilterMode('wrong')}
                >
                  <Text>错题</Text>
                </View>
              </View>
            </View>

            <View className={styles.resultList}>
              {displayQuestions.map(({ question, originalIndex }, i) => {
                const correct = isAnswerCorrect(question, answers[originalIndex]);
                return (
                  <View
                    key={question.id}
                    className={styles.resultItem}
                    onClick={() => setShowQuestionDetail(originalIndex)}
                  >
                    <View className={classnames(styles.resultIndex, correct ? styles.correct : styles.wrong)}>
                      {correct ? '✓' : '✗'}
                    </View>
                    <Text className={styles.resultQuestion} numberOfLines={2}>
                      {filterMode === 'all' ? `${originalIndex + 1}. ` : ''}
                      {question.question}
                    </Text>
                    <Text className={styles.resultArrow}>›</Text>
                  </View>
                );
              })}
              {displayQuestions.length === 0 && (
                <View style={{ padding: '40rpx', textAlign: 'center', color: '#86909C', fontSize: '28rpx' }}>
                  🎉 太棒了，没有错题！
                </View>
              )}
            </View>
          </View>

          <View className={styles.resultFooter}>
            <View className={classnames(styles.btn, styles.btnOutline)} onClick={restartExam}>
              <Text>返回首页</Text>
            </View>
            {practiceCategory && wrongCategories.length > 0 && (
              <View
                className={classnames(styles.btn, styles.btnPrimary)}
                onClick={() => startPractice(wrongCategories[0])}
              >
                <Text>继续练习</Text>
              </View>
            )}
            {!practiceCategory && (
              <View className={classnames(styles.btn, styles.btnPrimary)} onClick={startExam}>
                <Text>再考一次</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {currentDetailQuestion && showQuestionDetail !== null && (
        <View className={styles.detailModal} onClick={() => setShowQuestionDetail(null)}>
          <View className={styles.detailContent} onClick={e => e.stopPropagation()}>
            <View className={styles.detailHeader}>
              <Text className={styles.detailTitle}>题目解析</Text>
              <Text className={styles.detailClose} onClick={() => setShowQuestionDetail(null)}>✕</Text>
            </View>
            <ScrollView scrollY style={{ maxHeight: '65vh' }}>
              <QuestionCard
                question={currentDetailQuestion}
                showAnswer={true}
                selectedAnswer={answers[showQuestionDetail]}
                onSelect={() => {}}
              />
            </ScrollView>
            <View
              className={classnames(
                styles.detailAddBtn,
                wrongQuestions.some(q => q.id === currentDetailQuestion.id)
              )}
              onClick={() => {
                if (wrongQuestions.some(q => q.id === currentDetailQuestion.id)) {
                  handleAddToTraining(currentDetailQuestion.category);
                }
              }}
            >
              <Text>加入补训计划</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ShiftExamPage;
