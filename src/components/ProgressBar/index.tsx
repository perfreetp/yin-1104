import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  label?: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  label,
  color
}) => {
  const percent = Math.round((current / total) * 100);

  return (
    <View>
      {showLabel && (
        <View className={styles.progressLabel}>
          <Text>{label || `${current}/${total}`}</Text>
          <Text className={styles.progressText}>{percent}%</Text>
        </View>
      )}
      <View className={styles.progressBar}>
        <View
          className={styles.progressFill}
          style={{ width: `${percent}%`, background: color }}
        />
      </View>
    </View>
  );
};

export default ProgressBar;
