import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { instrumentTypes, stepKeys } from '@/data/processes';

interface FormData {
  instrumentType: string;
  batchNo: string;
  recycleTime: string;
  recycleOperator: string;
  cleanMethod: string;
  cleanOperator: string;
  packOperator: string;
  packDate: string;
  sterilizerNo: string;
  sterilizeTemp: string;
  sterilizeTime: string;
  sterilizeDuration: string;
  releaseOperator: string;
  releaseTime: string;
  bioMonitor: string;
}

const requiredFields: { key: keyof FormData; label: string; step: number }[] = [
  { key: 'instrumentType', label: '器械类型', step: 0 },
  { key: 'batchNo', label: '批次号', step: 0 },
  { key: 'recycleTime', label: '回收时间', step: 1 },
  { key: 'recycleOperator', label: '回收人员', step: 1 },
  { key: 'cleanMethod', label: '清洗方式', step: 2 },
  { key: 'cleanOperator', label: '清洗人员', step: 2 },
  { key: 'packOperator', label: '包装人员', step: 3 },
  { key: 'packDate', label: '包装日期', step: 3 },
  { key: 'sterilizerNo', label: '灭菌器编号', step: 4 },
  { key: 'sterilizeTemp', label: '灭菌温度', step: 4 },
  { key: 'sterilizeTime', label: '灭菌时间', step: 4 },
  { key: 'releaseOperator', label: '放行人员', step: 5 },
  { key: 'releaseTime', label: '放行时间', step: 5 },
  { key: 'bioMonitor', label: '生物监测', step: 5 },
];

const SimulationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    instrumentType: '',
    batchNo: '',
    recycleTime: '',
    recycleOperator: '',
    cleanMethod: '',
    cleanOperator: '',
    packOperator: '',
    packDate: '',
    sterilizerNo: '',
    sterilizeTemp: '',
    sterilizeTime: '',
    sterilizeDuration: '',
    releaseOperator: '',
    releaseTime: '',
    bioMonitor: '',
  });

  const totalSteps = 6;

  const handleInput = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const completedSteps = useMemo(() => {
    let completed = 0;
    for (let i = 0; i <= currentStep; i++) {
      const stepFields = requiredFields.filter(f => f.step === i);
      const allFilled = stepFields.every(f => formData[f.key]?.trim());
      if (allFilled) completed++;
    }
    return completed;
  }, [currentStep, formData]);

  const missingItems = useMemo(() => {
    return requiredFields.filter(f => !formData[f.key]?.trim());
  }, [formData]);

  const score = useMemo(() => {
    const filled = requiredFields.filter(f => formData[f.key]?.trim()).length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [formData]);

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const handleReset = () => {
    setFormData({
      instrumentType: '',
      batchNo: '',
      recycleTime: '',
      recycleOperator: '',
      cleanMethod: '',
      cleanOperator: '',
      packOperator: '',
      packDate: '',
      sterilizerNo: '',
      sterilizeTemp: '',
      sterilizeTime: '',
      sterilizeDuration: '',
      releaseOperator: '',
      releaseTime: '',
      bioMonitor: '',
    });
    setCurrentStep(0);
    setShowResult(false);
    Taro.showToast({ title: '已重置', icon: 'success' });
  };

  const getScoreLevel = () => {
    if (score >= 90) return 'good';
    if (score >= 70) return 'medium';
    return 'bad';
  };

  const stepTitles = ['基本信息', ...stepKeys.map(s => s.title)];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View className={styles.formCard}>
            <View className={styles.formCardHeader}>
              <Text className={styles.formCardIcon}>📋</Text>
              <Text className={styles.formCardTitle}>基本信息</Text>
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                器械类型
              </Text>
              <Input
                className={styles.formInput}
                placeholder="请选择器械类型"
                value={formData.instrumentType}
                onInput={e => handleInput('instrumentType', e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                批次号
              </Text>
              <Input
                className={styles.formInput}
                placeholder="如：20240117-001"
                value={formData.batchNo}
                onInput={e => handleInput('batchNo', e.detail.value)}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View className={styles.formCard}>
            <View className={styles.formCardHeader}>
              <Text className={styles.formCardIcon}>♻️</Text>
              <Text className={styles.formCardTitle}>回收环节</Text>
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                回收时间
              </Text>
              <Input
                className={styles.formInput}
                placeholder="如：2024-01-17 09:30"
                value={formData.recycleTime}
                onInput={e => handleInput('recycleTime', e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                回收人员
              </Text>
              <Input
                className={styles.formInput}
                placeholder="请输入回收人员姓名"
                value={formData.recycleOperator}
                onInput={e => handleInput('recycleOperator', e.detail.value)}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View className={styles.formCard}>
            <View className={styles.formCardHeader}>
              <Text className={styles.formCardIcon}>🚿</Text>
              <Text className={styles.formCardTitle}>清洗环节</Text>
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                清洗方式
              </Text>
              <Input
                className={styles.formInput}
                placeholder="如：全自动清洗消毒器"
                value={formData.cleanMethod}
                onInput={e => handleInput('cleanMethod', e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                清洗人员
              </Text>
              <Input
                className={styles.formInput}
                placeholder="请输入清洗人员姓名"
                value={formData.cleanOperator}
                onInput={e => handleInput('cleanOperator', e.detail.value)}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View className={styles.formCard}>
            <View className={styles.formCardHeader}>
              <Text className={styles.formCardIcon}>📦</Text>
              <Text className={styles.formCardTitle}>包装环节</Text>
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                包装人员
              </Text>
              <Input
                className={styles.formInput}
                placeholder="请输入包装人员姓名"
                value={formData.packOperator}
                onInput={e => handleInput('packOperator', e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                包装日期
              </Text>
              <Input
                className={styles.formInput}
                placeholder="如：2024-01-17"
                value={formData.packDate}
                onInput={e => handleInput('packDate', e.detail.value)}
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View className={styles.formCard}>
            <View className={styles.formCardHeader}>
              <Text className={styles.formCardIcon}>🔥</Text>
              <Text className={styles.formCardTitle}>灭菌环节</Text>
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                灭菌器编号
              </Text>
              <Input
                className={styles.formInput}
                placeholder="如：MJ-001"
                value={formData.sterilizerNo}
                onInput={e => handleInput('sterilizerNo', e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                灭菌温度
              </Text>
              <Input
                className={styles.formInput}
                placeholder="如：134℃"
                value={formData.sterilizeTemp}
                onInput={e => handleInput('sterilizeTemp', e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                灭菌时间
              </Text>
              <Input
                className={styles.formInput}
                placeholder="如：4分钟"
                value={formData.sterilizeTime}
                onInput={e => handleInput('sterilizeTime', e.detail.value)}
              />
            </View>
          </View>
        );

      case 5:
        return (
          <View className={styles.formCard}>
            <View className={styles.formCardHeader}>
              <Text className={styles.formCardIcon}>✅</Text>
              <Text className={styles.formCardTitle}>放行环节</Text>
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                放行人员
              </Text>
              <Input
                className={styles.formInput}
                placeholder="请输入放行人员姓名"
                value={formData.releaseOperator}
                onInput={e => handleInput('releaseOperator', e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                放行时间
              </Text>
              <Input
                className={styles.formInput}
                placeholder="如：2024-01-17 11:30"
                value={formData.releaseTime}
                onInput={e => handleInput('releaseTime', e.detail.value)}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                生物监测
              </Text>
              <Input
                className={styles.formInput}
                placeholder="如：阴性/阳性"
                value={formData.bioMonitor}
                onInput={e => handleInput('bioMonitor', e.detail.value)}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>模拟录入</Text>
        <Text className={styles.headerDesc}>练习追溯单填写，减少实际工作漏登</Text>
      </View>

      <View className={styles.progressSection}>
        <View className={styles.stepsNav}>
          {stepTitles.map((title, index) => (
            <View
              key={index}
              className={classnames(
                styles.stepNavItem,
                currentStep === index && styles.active,
                index < currentStep && styles.completed
              )}
              onClick={() => setCurrentStep(index)}
            >
              <View className={styles.stepNavCircle}>
                {index < currentStep ? '✓' : index + 1}
              </View>
              <Text className={styles.stepNavLabel}>{title}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY className={styles.formSection}>
        {renderStepContent()}
      </ScrollView>

      <View className={styles.bottomBar}>
        {currentStep > 0 ? (
          <View className={classnames(styles.btn, styles.btnOutline)} onClick={handlePrev}>
            <Text>上一步</Text>
          </View>
        ) : null}
        {currentStep < totalSteps - 1 ? (
          <View className={classnames(styles.btn, styles.btnPrimary)} onClick={handleNext}>
            <Text>下一步</Text>
          </View>
        ) : (
          <View className={classnames(styles.btn, styles.btnPrimary)} onClick={handleSubmit}>
            <Text>提交检测</Text>
          </View>
        )}
      </View>

      {showResult && (
        <View className={styles.resultOverlay} onClick={() => setShowResult(false)}>
          <View className={styles.resultModal} onClick={e => e.stopPropagation()}>
            <View className={styles.resultHeader}>
              <Text className={classnames(styles.resultScore, styles[getScoreLevel()])}>{score}分</Text>
              <Text className={styles.resultScoreLabel}>
                {score >= 90 ? '优秀！继续保持' : score >= 70 ? '良好，还需努力' : '加油，多多练习'}
              </Text>
            </View>

            <View className={styles.resultSection}>
              <Text className={styles.resultSectionTitle}>
                漏项清单 ({missingItems.length}项)
              </Text>
              {missingItems.length > 0 ? (
                missingItems.map((item, index) => (
                  <View key={index} className={styles.missingItem}>
                    <Text className={styles.missingIcon}>⚠️</Text>
                    <Text>{item.label} - 未填写</Text>
                  </View>
                ))
              ) : (
                <View className={styles.tipItem}>
                  <Text className={styles.tipIcon}>🎉</Text>
                  <Text className={styles.tipText}>太棒了！所有必填项均已填写完整</Text>
                </View>
              )}
            </View>

            <View className={styles.resultSection}>
              <Text className={styles.resultSectionTitle}>操作提示</Text>
              <View className={styles.tipItem}>
                <Text className={styles.tipIcon}>💡</Text>
                <Text className={styles.tipText}>
                  追溯单填写是消毒工作的重要环节，完整准确的记录是质量追溯的基础。
                </Text>
              </View>
              <View className={styles.tipItem}>
                <Text className={styles.tipIcon}>📝</Text>
                <Text className={styles.tipText}>
                  每一项记录都应清晰可辨，不得涂改，如有错误应划改并签名。
                </Text>
              </View>
            </View>

            <View className={classnames(styles.btn, styles.btnPrimary, styles.btnFull)} onClick={handleReset}>
              <Text>再练一次</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SimulationPage;
