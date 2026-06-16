import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import { ProcessStep } from '@/types';

interface StepCardProps {
  step: ProcessStep;
  index: number;
  color?: string;
}

const StepCard: React.FC<StepCardProps> = ({ step, index, color = '#00A870' }) => {
  return (
    <View className={styles.stepCard} style={{ borderLeftColor: color }}>
      <View className={styles.stepHeader}>
        <View className={styles.stepIcon} style={{ background: `${color}15` }}>
          <Text>{index + 1}</Text>
        </View>
        <View className={styles.stepTitle}>
          <Text className={styles.stepTitleText}>{step.title}</Text>
          <Text className={styles.stepDuration}>预计时长：{step.duration}</Text>
        </View>
      </View>
      <Text className={styles.stepDescription}>{step.description}</Text>
      <View className={styles.stepKeyPoints}>
        <Text className={styles.keyPointTitle}>操作要点</Text>
        {step.keyPoints.map((point, idx) => (
          <View key={idx} className={styles.keyPointItem}>
            <View className={styles.keyPointDot} style={{ background: color }} />
            <Text>{point}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default StepCard;
