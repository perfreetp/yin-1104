import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { instrumentTypes, stepKeys } from '@/data/processes';
import { ValidationError } from '@/types';

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

const MIN_TEMP = 121;
const MAX_TEMP = 138;
const MIN_DURATION_MIN = 3;
const MAX_DURATION_MIN = 60;

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

  const validationErrors = useMemo((): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (formData.sterilizeTemp.trim()) {
      const tempMatch = formData.sterilizeTemp.match(/(\d+(\.\d+)?)/);
      if (tempMatch) {
        const temp = parseFloat(tempMatch[1]);
        if (temp < MIN_TEMP || temp > MAX_TEMP) {
          errors.push({
            field: 'sterilizeTemp',
            label: '灭菌温度',
            message: `灭菌温度应在${MIN_TEMP}℃-${MAX_TEMP}℃之间`,
            suggestion: temp < MIN_TEMP
              ? `当前温度${temp}℃过低，建议调整至121℃(下排气)或134℃(预真空)`
              : `当前温度${temp}℃过高，建议调整至121℃(下排气)或134℃(预真空)`
          });
        }
      } else {
        errors.push({
          field: 'sterilizeTemp',
          label: '灭菌温度',
          message: '温度格式不正确',
          suggestion: '请填写数字+℃，例如：134℃'
        });
      }
    }

    if (formData.sterilizeTime.trim()) {
      const durationMatch = formData.sterilizeTime.match(/(\d+)/);
      if (durationMatch) {
        const minutes = parseInt(durationMatch[1]);
        if (minutes < MIN_DURATION_MIN || minutes > MAX_DURATION_MIN) {
          errors.push({
            field: 'sterilizeTime',
            label: '灭菌时间',
            message: `灭菌时间应在${MIN_DURATION_MIN}-${MAX_DURATION_MIN}分钟之间`,
            suggestion: minutes < MIN_DURATION_MIN
              ? `当前${minutes}分钟过短，134℃预真空至少需4分钟，121℃下排气至少需20分钟`
              : `当前${minutes}分钟过长，请检查灭菌程序设置是否正确`
          });
        }
      } else {
        errors.push({
          field: 'sterilizeTime',
          label: '灭菌时间',
          message: '时间格式不正确',
          suggestion: '请填写数字+分钟，例如：4分钟'
        });
      }
    }

    if (formData.bioMonitor.trim()) {
      const bio = formData.bioMonitor.trim();
      if (!['阴性', '阳性', '阴', '阳'].includes(bio)) {
        errors.push({
          field: 'bioMonitor',
          label: '生物监测',
          message: '生物监测结果只能是阴性或阳性',
          suggestion: '请填写"阴性"或"阳性"'
        });
      } else if (['阳性', '阳'].includes(bio)) {
        errors.push({
          field: 'bioMonitor',
          label: '生物监测',
          message: '生物监测为阳性，灭菌不合格！',
          suggestion: '⚠️ 生物监测阳性表示灭菌失败，该批次器械禁止放行！需立即启动召回程序，重新灭菌并查找原因'
        });
      }
    }

    if (formData.batchNo.trim()) {
      if (!/\d/.test(formData.batchNo)) {
        errors.push({
          field: 'batchNo',
          label: '批次号',
          message: '批次号应包含日期信息',
          suggestion: '建议格式：YYYYMMDD-序号，如：20240117-001'
        });
      }
    }

    return errors;
  }, [formData]);

  const score = useMemo(() => {
    const filled = requiredFields.filter(f => formData[f.key]?.trim()).length;
    const filledScore = (filled / requiredFields.length) * 70;
    const validScore = validationErrors.length === 0 ? 30 : Math.max(0, 30 - validationErrors.length * 10);
    return Math.round(filledScore + validScore);
  }, [formData, validationErrors]);

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
            <View className={styles.formHint}>
              <Text>💡 标准参数：预真空134℃/4分钟，下排气121℃/20分钟</Text>
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
                className={classnames(
                  styles.formInput,
                  validationErrors.some(e => e.field === 'sterilizeTemp') && styles.inputError
                )}
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
                className={classnames(
                  styles.formInput,
                  validationErrors.some(e => e.field === 'sterilizeTime') && styles.inputError
                )}
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
            <View className={styles.formHint}>
              <Text>⚠️ 生物监测必须为阴性才能放行</Text>
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
                className={classnames(
                  styles.formInput,
                  validationErrors.some(e => e.field === 'bioMonitor') && styles.inputError
                )}
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

            {validationErrors.length > 0 && (
              <View className={styles.resultSection}>
                <Text className={styles.resultSectionTitle}>
                  数据校验 ({validationErrors.length}项问题)
                </Text>
                {validationErrors.map((err, index) => (
                  <View key={index} className={styles.validationItem}>
                    <View className={styles.validationHeader}>
                      <Text className={styles.validationIcon}>🚫</Text>
                      <Text className={styles.validationField}>{err.label}</Text>
                    </View>
                    <Text className={styles.validationMessage}>{err.message}</Text>
                    <View className={styles.validationSuggestion}>
                      <Text className={styles.suggestionIcon}>💡</Text>
                      <Text className={styles.suggestionText}>{err.suggestion}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View className={styles.resultSection}>
              <Text className={styles.resultSectionTitle}>操作提示</Text>
              <View className={styles.tipItem}>
                <Text className={styles.tipIcon}>💡</Text>
                <Text className={styles.tipText}>
                  追溯单填写是消毒工作的重要环节，完整准确的记录是质量追溯的基础。
                </Text>
              </View>
              <View className={styles.tipItem}>
                <Text className={styles.tipIcon}>🌡️</Text>
                <Text className={styles.tipText}>
                  灭菌温度：预真空134℃、下排气121℃；灭菌时间：预真空4-20分钟、下排气20-30分钟。
                </Text>
              </View>
              <View className={styles.tipItem}>
                <Text className={styles.tipIcon}>🧪</Text>
                <Text className={styles.tipText}>
                  生物监测必须为"阴性"才能放行，阳性表示灭菌失败，需立即召回。
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
