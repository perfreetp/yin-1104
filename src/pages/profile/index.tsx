import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { userProfile, examRecords } from '@/data/user';
import { ExamRecord, TrainingTask } from '@/types';

const ProfilePage: React.FC = () => {
  const [signed, setSigned] = useState(userProfile.signedProcess);
  const [showSignModal, setShowSignModal] = useState(false);

  const roleName = userProfile.role === 'nurse' ? '护士' : '消毒员';

  const handleSign = () => {
    setSigned(true);
    setShowSignModal(false);
    Taro.showToast({ title: '签署成功', icon: 'success' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return { month: `${month}月`, day: `${day}日` };
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.userCard}>
          <Image
            className={styles.avatar}
            src={userProfile.avatar}
            mode="aspectFill"
          />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{userProfile.name}</Text>
            <Text className={styles.userRole}>{roleName}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statsGrid}>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{userProfile.totalExams}</Text>
            <Text className={styles.statsLabel}>考试次数</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{userProfile.passRate}%</Text>
            <Text className={styles.statsLabel}>通过率</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{userProfile.avgScore}</Text>
            <Text className={styles.statsLabel}>平均分</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>⚠️</Text>
            易错环节
          </Text>
        </View>
        <View className={styles.weakPoints}>
          {userProfile.weakPoints.map((point, index) => (
            <Text key={index} className={styles.weakPointTag}>
              {point}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📚</Text>
            补训任务
          </Text>
          <Text className={styles.sectionMore}>
            {userProfile.trainingTasks.filter(t => t.status === 'pending').length} 项待完成
          </Text>
        </View>
        <View className={styles.taskList}>
          {userProfile.trainingTasks.map((task: TrainingTask) => (
            <View key={task.id} className={styles.taskItem}>
              <View className={classnames(styles.taskIcon, task.status === 'completed' && styles.completed)}>
                <Text>{task.status === 'completed' ? '✓' : '📋'}</Text>
              </View>
              <View className={styles.taskContent}>
                <Text className={styles.taskTitle}>{task.title}</Text>
                <Text className={styles.taskDesc}>{task.description}</Text>
                <View className={styles.taskMeta}>
                  <Text className={styles.taskDeadline}>截止：{task.deadline}</Text>
                  <Text className={classnames(styles.taskStatus, styles[task.status])}>
                    {task.status === 'completed' ? '已完成' : '待完成'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📊</Text>
            历史成绩
          </Text>
          <Text className={styles.sectionMore}>查看全部</Text>
        </View>
        <View className={styles.recordList}>
          {examRecords.slice(0, 5).map((record: ExamRecord) => {
            const dateInfo = formatDate(record.date);
            return (
              <View key={record.id} className={styles.recordItem}>
                <View className={styles.recordDate}>
                  <Text className={styles.recordDay}>{dateInfo.day}</Text>
                  <Text className={styles.recordMonth}>{dateInfo.month}</Text>
                </View>
                <View className={styles.recordContent}>
                  <Text className={styles.recordTitle}>
                    {record.role === 'nurse' ? '护士' : '消毒员'}考核
                  </Text>
                  <Text className={styles.recordDesc}>
                    {record.correctCount}/{record.totalQuestions}题 · 用时{Math.floor(record.duration / 60)}分
                  </Text>
                </View>
                <View className={styles.recordScore}>
                  <Text className={classnames(styles.scoreValue, !record.pass && styles.fail)}>
                    {record.score}分
                  </Text>
                  <Text className={styles.scoreLabel}>
                    {record.pass ? '通过' : '未通过'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.signSection}>
          <View className={styles.signHeader}>
            <Text className={styles.signIcon}>📝</Text>
            <Text className={styles.signTitle}>上岗流程确认</Text>
            <Text className={classnames(styles.signStatus, signed ? styles.signed : styles.unsigned)}>
              {signed ? '已签署' : '待签署'}
            </Text>
          </View>
          <View className={styles.signContent}>
            本人已认真学习消毒追溯流程的所有环节，包括回收、清洗、包装、灭菌、放行的操作规范和质量要求，
            承诺在实际工作中严格遵守相关规定，确保消毒质量和患者安全。
          </View>
          <View
            className={classnames(styles.signBtn, signed && styles.disabled)}
            onClick={() => !signed && setShowSignModal(true)}
          >
            <Text>{signed ? '已完成签署' : '立即签署'}</Text>
          </View>
        </View>
      </View>

      {showSignModal && (
        <View className={styles.signModal} onClick={() => setShowSignModal(false)}>
          <View className={styles.signModalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.signModalTitle}>流程确认书</Text>
            <Text className={styles.signModalText}>
              本人{userProfile.name}，作为{roleName}，已认真学习并掌握消毒追溯的全部流程和规范要求。{'\n\n'}
              本人承诺：{'\n'}
              1. 严格按照标准流程进行操作{'\n'}
              2. 认真填写每一项追溯记录{'\n'}
              3. 发现问题及时上报{'\n'}
              4. 对消毒质量负责
            </Text>
            <View className={styles.signModalActions}>
              <View className={classnames(styles.signModalBtn, styles.btnCancel)} onClick={() => setShowSignModal(false)}>
                <Text>取消</Text>
              </View>
              <View className={classnames(styles.signModalBtn, styles.btnConfirm)} onClick={handleSign}>
                <Text>确认签署</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfilePage;
