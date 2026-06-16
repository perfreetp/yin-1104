import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import { Question, ExamRecord } from '@/types';
import { useAppStore } from '@/store';

type RoleType = 'nurse' | 'disinfector';
type ExamStatus = 'idle' | 'exam' | 'result';

const ShiftExamPage: React.FC = () => {
  const [role, setRole] = useState<RoleType>('disinfector');
  const [examStatus, setExamStatus] = useState<ExamStatus>('idle');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [timer, setTimer] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getRoleExamQuestions = useAppStore(s => s.getRoleExamQuestions);
  const addExamRecord = useAppStore(s => s.addExamRecord);

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

  const startExam = () => {
    const questions = getRoleExamQuestions(role, examCount);
    console.log('[Exam] Generated questions for role:', role, 'count:', questions.length);
    setExamQuestions(questions);
    setCurrentIndex(0);
    setAnswers({});
    setTimer(0);
    setHasSaved(false);
    setExamStatus('exam');

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
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

  const submitExam = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

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

      {examStatus === 'exam' && examQuestions.length > 0 && (
        <>
          <View className={styles.section}>
            <View className={styles.examCard}>
              <View className={styles.examHeader}>
                <View className={styles.examInfo}>
                  <Text>第 {currentIndex + 1} / {examQuestions.length} 题</Text>
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
                className={classnames(styles.btn, styles.btnPrimary, answeredCount === 0 && styles.btnDisabled)}
                onClick={submitExam}
              >
                <Text>提交答卷</Text>
              </View>
            )}
          </View>
        </>
      )}

      {examStatus === 'result' && (
        <View className={styles.resultModal}>
          <View className={styles.resultContent}>
            <View className={classnames(styles.resultHeader, !isPass && styles.fail)}>
              <Text className={styles.resultScore}>{score}分</Text>
              <Text className={styles.resultLabel}>
                {isPass ? '🎉 考核通过，可以上岗' : '💪 继续努力，加油'}
              </Text>
            </View>
            <View className={styles.resultStats}>
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
            <View className={styles.resultBody}>
              {examQuestions.map((q, index) => {
                const correct = isAnswerCorrect(q, answers[index]);
                return (
                  <View key={q.id} className={styles.resultItem}>
                    <View className={classnames(styles.resultIndex, correct ? styles.correct : styles.wrong)}>
                      {correct ? '✓' : '✗'}
                    </View>
                    <Text className={styles.resultQuestion}>{q.question}</Text>
                  </View>
                );
              })}
            </View>
            <View className={styles.resultFooter}>
              <View className={classnames(styles.btn, styles.btnOutline)} onClick={restartExam}>
                <Text>返回</Text>
              </View>
              <View className={classnames(styles.btn, styles.btnPrimary)} onClick={startExam}>
                <Text>再考一次</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ShiftExamPage;
