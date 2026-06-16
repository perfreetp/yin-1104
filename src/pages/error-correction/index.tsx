import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { scenarioQuestions } from '@/data/questions';
import QuestionCard from '@/components/QuestionCard';
import { Question, WrongQuestion } from '@/types';
import { useAppStore } from '@/store';

type TabType = 'wrong' | 'scenario';

const ErrorCorrectionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('wrong');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | undefined>(undefined);
  const [practiceTab, setPracticeTab] = useState<'all' | 'unmastered' | 'mastered'>('unmastered');

  const wrongQuestions = useAppStore(s => s.wrongQuestions);
  const addPracticeRecord = useAppStore(s => s.addPracticeRecord);
  const getWeakPoints = useAppStore(s => s.getWeakPoints);
  const removeWrongQuestion = useAppStore(s => s.removeWrongQuestion);
  const weakPoints = useMemo(() => getWeakPoints(), [getWeakPoints, wrongQuestions]);

  const displayQuestions = useMemo(() => {
    if (practiceTab === 'all') return wrongQuestions;
    if (practiceTab === 'mastered') return wrongQuestions.filter(wq => wq.mastered);
    return wrongQuestions.filter(wq => !wq.mastered);
  }, [wrongQuestions, practiceTab]);

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
    if (question.type === 'multiple') {
      setSelectedAnswer([]);
    } else {
      setSelectedAnswer(undefined);
    }
  };

  const handleSelectOption = (index: number) => {
    if (selectedQuestion?.type === 'multiple') {
      const current = (selectedAnswer as number[]) || [];
      if (current.includes(index)) {
        setSelectedAnswer(current.filter(i => i !== index));
      } else {
        setSelectedAnswer([...current, index]);
      }
    } else {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (!selectedQuestion || selectedAnswer === undefined) return;

    const currentQ = selectedQuestion;
    let correct = false;
    if (Array.isArray(currentQ.answer)) {
      if (Array.isArray(selectedAnswer)) {
        correct = selectedAnswer.length === currentQ.answer.length &&
          selectedAnswer.every(a => currentQ.answer.includes(a));
      }
    } else {
      correct = selectedAnswer === currentQ.answer;
    }

    addPracticeRecord({
      id: `practice_${Date.now()}`,
      questionId: currentQ.id,
      questionType: currentQ.type,
      category: currentQ.category,
      isCorrect: correct,
      timestamp: Date.now()
    }, currentQ);

    setShowAnswer(true);

    Taro.showToast({
      title: correct ? '回答正确' : '回答错误',
      icon: correct ? 'success' : 'none'
    });
  };

  const handleRemoveWrong = (questionId: string) => {
    Taro.showModal({
      title: '确认移除',
      content: '确定将该题从错题本中移除？',
      success: (res) => {
        if (res.confirm) {
          removeWrongQuestion(questionId);
          Taro.showToast({ title: '已移除', icon: 'success' });
          if (selectedQuestion?.id === questionId) {
            closeModal();
          }
        }
      }
    });
  };

  const closeModal = () => {
    setSelectedQuestion(null);
    setShowAnswer(false);
    setSelectedAnswer(undefined);
  };

  const renderMasteryStars = (level: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text
          key={i}
          className={classnames(styles.star, i < level && styles.starActive)}
        >
          ★
        </Text>
      );
    }
    return stars;
  };

  const renderWrongQuestions = () => (
    <View>
      <View className={styles.filterTabs}>
        <View
          className={classnames(styles.filterTab, practiceTab === 'unmastered' && styles.active)}
          onClick={() => setPracticeTab('unmastered')}
        >
          <Text>待掌握</Text>
          <Text className={styles.filterCount} >
            {wrongQuestions.filter(wq => !wq.mastered).length}
          </Text>
        </View>
        <View
          className={classnames(styles.filterTab, practiceTab === 'mastered' && styles.active)}
          onClick={() => setPracticeTab('mastered')}
        >
          <Text>已掌握</Text>
          <Text className={styles.filterCount} >
            {wrongQuestions.filter(wq => wq.mastered).length}
          </Text>
        </View>
        <View
          className={classnames(styles.filterTab, practiceTab === 'all' && styles.active)}
          onClick={() => setPracticeTab('all')}
        >
          <Text>全部</Text>
          <Text className={styles.filterCount} >
            {wrongQuestions.length}
          </Text>
        </View>
      </View>

      <View className={styles.questionList}>
        {displayQuestions.length > 0 ? (
          displayQuestions.map((q: WrongQuestion, index: number) => (
            <View
              key={q.id}
              className={styles.wrongQuestionItem}
              onClick={() => handleSelectQuestion(q)}
            >
              <View className={styles.wrongQuestionHeader}>
                <Text className={styles.wrongQuestionType}>第{index + 1}题</Text>
                <View className={styles.wrongQuestionMeta}>
                  {q.mastered ? (
                    <Text className={styles.masteredTag}>已掌握</Text>
                  ) : (
                    <Text className={styles.wrongCount}>错{q.wrongCount}次</Text>
                  )}
                </View>
              </View>
              <Text className={styles.wrongQuestionText}>{q.question}</Text>
              <View className={styles.wrongQuestionFooter}>
                <Text className={styles.categoryTag}>{q.category}</Text>
                <View className={styles.masteryStars}>
                  {renderMasteryStars(q.masteryLevel)}
                </View>
              </View>
            </View>
          ))
        ) : (
            <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎉</Text>
            <Text className={styles.emptyText}>
              {practiceTab === 'mastered' ? '暂无已掌握题目' : '暂无错题，继续保持！'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderScenarioQuestions = () => (
    <View>
      {scenarioQuestions.map((q, index) => (
        <View key={q.id} className={styles.scenarioCard}>
          <View className={styles.scenarioTitle}>
            <Text className={styles.scenarioIcon}>🎭</Text>
            <Text>情景题 {index + 1}</Text>
          </View>
          <Text className={styles.scenarioDesc}>{q.question}</Text>
          <View className={styles.practiceBtn} onClick={() => handleSelectQuestion(q)}>
            <Text>开始练习</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const canSubmit = () => {
    if (!selectedQuestion) return false;
    if (selectedQuestion.type === 'multiple') {
      return Array.isArray(selectedAnswer) && selectedAnswer.length > 0;
    }
    return selectedAnswer !== undefined;
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>错题纠偏</Text>
        <Text className={styles.headerDesc}>针对薄弱环节，重点突破</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{wrongQuestions.length}</Text>
          <Text className={styles.statLabel}>错题总数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{wrongQuestions.filter(wq => wq.mastered).length}</Text>
          <Text className={styles.statLabel}>已掌握</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{weakPoints.length}</Text>
          <Text className={styles.statLabel}>薄弱环节</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.weakPointsTitle}>🔥 易错环节</Text>
        <View className={styles.weakPointsList}>
          {weakPoints.length > 0 ? (
            weakPoints.map((point, index) => (
              <Text key={index} className={styles.weakPointTag}>
                {point}
              </Text>
            ))
          ) : (
            <Text style={{ fontSize: '26rpx', color: '#86909C', padding: '16rpx' }}>
              暂无记录，完成考核后自动生成
            </Text>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.tabs}>
          <View
            className={classnames(styles.tabItem, activeTab === 'wrong' && styles.active)}
            onClick={() => setActiveTab('wrong')}
          >
            <Text>错题本</Text>
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'scenario' && styles.active)}
            onClick={() => setActiveTab('scenario')}
          >
            <Text>情景题</Text>
          </View>
        </View>

        {activeTab === 'wrong' ? renderWrongQuestions() : renderScenarioQuestions()}
      </View>

      {selectedQuestion && (
        <View className={styles.detailModal} onClick={closeModal}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>题目详情</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: '24rpx' }}>
                {wrongQuestions.some(wq => wq.id === selectedQuestion.id) && (
                  <Text
                    className={styles.removeBtn}
                    onClick={() => handleRemoveWrong(selectedQuestion.id)}
                  >
                    移除
                  </Text>
                )}
                <Text className={styles.modalClose} onClick={closeModal}>✕</Text>
              </View>
            </View>

            {wrongQuestions.find(wq => wq.id === selectedQuestion.id) && (
              <View className={styles.masteryInfo}>
              <Text className={styles.masteryLabel}>掌握度</Text>
                <View className={styles.masteryStarsLarge}>
                  {renderMasteryStars(
                    wrongQuestions.find(wq => wq.id === selectedQuestion.id)?.masteryLevel || 0
                  )}
                </View>
              </View>
            )}

            <ScrollView scrollY style={{ maxHeight: '55vh', flex: 1 }}>
              <QuestionCard
                question={selectedQuestion}
                showAnswer={showAnswer}
                selectedAnswer={selectedAnswer}
                onSelect={handleSelectOption}
              />
            </ScrollView>

            {!showAnswer && (
              <View
                className={classnames(styles.submitBtn, !canSubmit() && styles.disabled)}
                onClick={handleSubmit}
              >
                <Text>提交答案</Text>
              </View>
            )}
            {showAnswer && (
              <View className={styles.submitBtn} onClick={closeModal}>
                <Text>关闭</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ErrorCorrectionPage;
