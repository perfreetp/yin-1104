import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { wrongQuestions, scenarioQuestions, questions } from '@/data/questions';
import { userProfile } from '@/data/user';
import QuestionCard from '@/components/QuestionCard';
import { Question, WrongQuestion } from '@/types';

type TabType = 'wrong' | 'scenario';

const ErrorCorrectionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('wrong');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(undefined);

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setShowAnswer(false);
    setSelectedAnswer(undefined);
  };

  const handleSelectOption = (index: number) => {
    if (selectedQuestion?.type === 'multiple') {
      return;
    }
    setSelectedAnswer(index);
    setShowAnswer(true);
  };

  const closeModal = () => {
    setSelectedQuestion(null);
    setShowAnswer(false);
    setSelectedAnswer(undefined);
  };

  const renderWrongQuestions = () => (
    <View className={styles.questionList}>
      {wrongQuestions.map((q: WrongQuestion, index: number) => (
        <View
          key={q.id}
          className={styles.wrongQuestionItem}
          onClick={() => handleSelectQuestion(q)}
        >
          <View className={styles.wrongQuestionHeader}>
            <Text className={styles.wrongQuestionType}>第{index + 1}题</Text>
            <Text className={styles.wrongCount}>错{q.wrongCount}次</Text>
          </View>
          <Text className={styles.wrongQuestionText}>{q.question}</Text>
          <View className={styles.wrongQuestionMeta}>
            <Text>{q.category} · {q.difficulty === 'easy' ? '简单' : q.difficulty === 'medium' ? '中等' : '困难'}</Text>
            <Text>最近错误：{q.lastWrongTime}</Text>
          </View>
        </View>
      ))}
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
          <View>
            {q.options.map((option, optIndex) => (
              <View key={optIndex} style={{ marginBottom: '16rpx' }}>
                <Text style={{ fontSize: '28rpx', color: '#4E5969' }}>
                  {String.fromCharCode(65 + optIndex)}. {option}
                </Text>
              </View>
            ))}
          </View>
          <View className={styles.practiceBtn} onClick={() => handleSelectQuestion(q)}>
            <Text>开始练习</Text>
          </View>
        </View>
      ))}
    </View>
  );

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
          <Text className={styles.statValue}>{scenarioQuestions.length}</Text>
          <Text className={styles.statLabel}>情景题</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{userProfile.weakPoints.length}</Text>
          <Text className={styles.statLabel}>薄弱环节</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.weakPointsTitle}>🔥 易错环节</Text>
        <View className={styles.weakPointsList}>
          {userProfile.weakPoints.map((point, index) => (
            <Text key={index} className={styles.weakPointTag}>
              {point}
            </Text>
          ))}
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
              <Text className={styles.modalClose} onClick={closeModal}>✕</Text>
            </View>
            <QuestionCard
              question={selectedQuestion}
              showAnswer={showAnswer}
              selectedAnswer={selectedAnswer}
              onSelect={handleSelectOption}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ErrorCorrectionPage;
