import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { instrumentTypes, stepKeys } from '@/data/processes';
import StepCard from '@/components/StepCard';
import { InstrumentType } from '@/types';

const ProcessStudyPage: React.FC = () => {
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>(instrumentTypes[0]);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const handleSelectInstrument = (instrument: InstrumentType) => {
    setSelectedInstrument(instrument);
    setActiveStep(null);
  };

  const filteredSteps = activeStep
    ? selectedInstrument.steps.filter(s => s.key === activeStep)
    : selectedInstrument.steps;

  const getStepColor = (key: string) => {
    const step = stepKeys.find(s => s.key === key);
    return step?.color || '#00A870';
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>流程学习</Text>
        <Text className={styles.headerDesc}>掌握标准消毒追溯流程，规范每一步操作</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleIcon}>🔧</Text>
          器械类型
        </Text>
        <ScrollView scrollX className={styles.instrumentScroll}>
          {instrumentTypes.map(instrument => (
            <View
              key={instrument.id}
              className={classnames(
                styles.instrumentCard,
                selectedInstrument.id === instrument.id && styles.active
              )}
              onClick={() => handleSelectInstrument(instrument)}
            >
              <Text className={styles.instrumentIcon}>{instrument.icon}</Text>
              <Text className={styles.instrumentName}>{instrument.name}</Text>
              <Text className={styles.instrumentCategory}>{instrument.category}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.section}>
        <View className={styles.selectedInfo}>
          <View className={styles.selectedIcon}>
            <Text>{selectedInstrument.icon}</Text>
          </View>
          <View className={styles.selectedText}>
            <Text className={styles.selectedName}>{selectedInstrument.name}</Text>
            <Text className={styles.selectedDesc}>
              共 {selectedInstrument.steps.length} 个步骤 · 总时长约 {
                selectedInstrument.steps.reduce((acc, s) => {
                  const match = s.duration.match(/\d+/);
                  return acc + (match ? parseInt(match[0]) : 0);
                }, 0)
              } 分钟
            </Text>
          </View>
        </View>

        <View className={styles.stepsNav}>
          <View
            className={classnames(styles.stepNavItem, !activeStep && styles.active)}
            onClick={() => setActiveStep(null)}
          >
            <Text className={styles.stepNavIcon}>📋</Text>
            <Text className={styles.stepNavTitle}>全部</Text>
          </View>
          {stepKeys.map(step => (
            <View
              key={step.key}
              className={classnames(styles.stepNavItem, activeStep === step.key && styles.active)}
              onClick={() => setActiveStep(step.key)}
            >
              <Text className={styles.stepNavIcon}>{step.icon}</Text>
              <Text className={styles.stepNavTitle}>{step.title}</Text>
            </View>
          ))}
        </View>

        <View className={styles.stepsContainer}>
          {filteredSteps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={selectedInstrument.steps.findIndex(s => s.id === step.id)}
              color={getStepColor(step.key)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProcessStudyPage;
