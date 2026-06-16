import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  showAnswer?: boolean;
  selectedAnswer?: number | number[];
  onSelect?: (answer: number) => void;
  showIndex?: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  showAnswer = false,
  selectedAnswer,
  onSelect,
  showIndex
}) => {
  const typeText: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    scenario: '情景题'
  };

  const difficultyText: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  const isCorrect = (index: number) => {
    if (!showAnswer) return false;
    if (Array.isArray(question.answer)) {
      return question.answer.includes(index);
    }
    return question.answer === index;
  };

  const isWrong = (index: number) => {
    if (!showAnswer || selectedAnswer === undefined) return false;
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(index) && !isCorrect(index);
    }
    return selectedAnswer === index && !isCorrect(index);
  };

  const isSelected = (index: number) => {
    if (selectedAnswer === undefined) return false;
    if (Array.isArray(selectedAnswer)) {
      return selectedAnswer.includes(index);
    }
    return selectedAnswer === index;
  };

  const handleSelect = (index: number) => {
    if (showAnswer) return;
    onSelect?.(index);
  };

  return (
    <View className={styles.questionCard}>
      <View className={styles.questionHeader}>
        {showIndex !== undefined && (
          <Text className={styles.questionType}>第{showIndex}题</Text>
        )}
        <Text className={styles.questionType}>{typeText[question.type]}</Text>
        <Text className={classnames(styles.difficulty, styles[question.difficulty])}>
          {difficultyText[question.difficulty]}
        </Text>
      </View>
      <Text className={styles.questionText}>{question.question}</Text>
      <View className={styles.options}>
        {question.options.map((option, index) => (
          <View
            key={index}
            className={classnames(
              styles.optionItem,
              isSelected(index) && styles.selected,
              isCorrect(index) && styles.correct,
              isWrong(index) && styles.wrong
            )}
            onClick={() => handleSelect(index)}
          >
            <Text className={styles.optionIndex}>{optionLabels[index]}</Text>
            <Text className={styles.optionText}>{option}</Text>
          </View>
        ))}
      </View>
      {showAnswer && (
        <View className={styles.explanation}>
          <Text className={styles.explanationTitle}>💡 答案解析</Text>
          <Text className={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
};

export default QuestionCard;
