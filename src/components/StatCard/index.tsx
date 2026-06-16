import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: 'up' | 'down';
  trendText?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  trend,
  trendText
}) => {
  return (
    <View className={styles.statCard}>
      <View className={styles.statHeader}>
        <Text className={styles.statLabel}>{label}</Text>
        {icon && <Text className={styles.statIcon}>{icon}</Text>}
      </View>
      <View className={styles.statValue}>
        <Text>{value}</Text>
        {unit && <Text className={styles.statUnit}>{unit}</Text>}
      </View>
      {trend && trendText && (
        <Text className={classnames(styles.statTrend, styles[trend])}>
          {trend === 'up' ? '↑' : '↓'} {trendText}
        </Text>
      )}
    </View>
  );
};

export default StatCard;
