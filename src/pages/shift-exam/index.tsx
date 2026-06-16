import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { questions } from '@/data/questions';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import { Question } from '@/types';

type RoleType = 'nurse' | 'disinfector';
type ExamStatus = 'idle' | 'exam' | 'result';

const ShiftExamPage: React.FC = () => {
  const [role, setRole] = useState<RoleType>('disinfector');
  const [examStatus, setExamStatus] = useState<ExamStatus>('idle');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const roleName: Record<RoleType, string> = {
    nurse: '护士',
    disinfector: '消毒员'
  };

  const examCount = 10;
  const passScore = 80;

  const generateExamQuestions = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, examCount);
  };

  const startExam = () => {
    setExamQuestions(generateExamQuestions());
    setCurrentIndex(0);
    setAnswers({});
    setTimer(0);
    setExamStatus('exam');

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

  const submitExam = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setExamStatus('result');
  };

  const calculateScore = () => {
    let correctCount = 0;
    examQuestions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (userAnswer === undefined) return;

      if (Array.isArray(q.answer)) {
        if (Array.isArray(userAnswer) &&
            userAnswer.length === q.answer.length &&
            userAnswer.every(a => q.answer.includes(a))) {
          correctCount++;
        }
      } else {
        if (userAnswer === q.answer) {
          correctCount++;
        }
      }
    });
    return Math.round((correctCount / examQuestions.length) * 100);
  };

  const getCorrectCount = () => {
    let count = 0;
    examQuestions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (userAnswer === undefined) return;

      if (Array.isArray(q.answer)) {
        if (Array.isArray(userAnswer) &&
            userAnswer.length === q.answer.length &&
            userAnswer.every(a => q.answer.includes(a))) {
          count++;
        }
      } else {
        if (userAnswer === q.answer) {
          count++;
        }
      }
    });
    return count;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const restartExam = () => {
    setExamStatus('idle');
  };

  const isQuestionCorrect = (index: number) => {
    const q = examQuestions[index];
    const userAnswer = answers[index];
    if (userAnswer === undefined) return false;

    if (Array.isArray(q.answer)) {
      if (Array.isArray(userAnswer) &&
          userAnswer.length === q.answer.length &&
          userAnswer.every(a => q.answer.includes(a))) {
        return true;
      }
      return false;
    } else {
      return userAnswer === q.answer;
    }
  };

  const score = calculateScore();
  const correctCount = getCorrectCount();
  const isPass = score >= passScore;
  const answeredCount = Object.keys(answers).length;

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
                随机抽取{examCount}道题目，检验你对消毒追溯流程的掌握程度
              </Text>
              <View className={styles.startExamBtn} onClick={startExam}>
                <Text>开始考试</Text>
              </View>
              <View className={styles.examTips}>
                <Text className={styles.tipsText}>
                  💡 提示：考试过程中可随时切换题目，答完后提交即可查看成绩
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
              {examQuestions.map((q, index) => (
                <View key={q.id} className={styles.resultItem}>
                  <View className={classnames(styles.resultIndex, isQuestionCorrect(index) ? styles.correct : styles.wrong)}>
                    {isQuestionCorrect(index) ? '✓' : '✗'}
                  </View>
                  <Text className={styles.resultQuestion}>{q.question}</Text>
                </View>
              ))}
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
