import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { ExamRecord, TrainingTask, TimelineItem } from '@/types';
import { useAppStore } from '@/store';

const ProfilePage: React.FC = () => {
  const userProfile = useAppStore(s => s.userProfile);
  const examRecords = useAppStore(s => s.examRecords);
  const trainingTasks = useAppStore(s => s.trainingTasks);
  const wrongQuestions = useAppStore(s => s.wrongQuestions);
  const practiceRecords = useAppStore(s => s.practiceRecords);

  const getStatistics = useAppStore(s => s.getStatistics);
  const getWeakPoints = useAppStore(s => s.getWeakPoints);
  const getReadinessScore = useAppStore(s => s.getReadinessScore);
  const getTimeline = useAppStore(s => s.getTimeline);
  const generateTrainingTasks = useAppStore(s => s.generateTrainingTasks);
  const markTaskCompleted = useAppStore(s => s.markTaskCompleted);
  const signProcess = useAppStore(s => s.signProcess);

  const [showSignModal, setShowSignModal] = useState(false);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItem | null>(null);

  const stats = useMemo(() => getStatistics(), [getStatistics, examRecords]);
  const weakPoints = useMemo(() => getWeakPoints(), [getWeakPoints, wrongQuestions, examRecords]);
  const readiness = useMemo(() => getReadinessScore(), [
    getReadinessScore,
    userProfile,
    examRecords,
    wrongQuestions,
    trainingTasks,
    practiceRecords
  ]);
  const timeline = useMemo(() => getTimeline(), [
    getTimeline,
    userProfile,
    examRecords,
    practiceRecords,
    trainingTasks
  ]);
  const tasks = useMemo(() => {
    if (trainingTasks.length === 0) {
      return generateTrainingTasks();
    }
    return trainingTasks;
  }, [trainingTasks, generateTrainingTasks, wrongQuestions, examRecords]);

  const roleName = userProfile.role === 'nurse' ? '护士' : '消毒员';

  const handleSign = () => {
    signProcess();
    setShowSignModal(false);
    Taro.showToast({ title: '签署成功', icon: 'success' });
  };

  const handleTaskClick = (task: TrainingTask) => {
    if (task.status === 'pending') {
      Taro.showModal({
        title: '完成任务',
        content: `确认已完成"${task.title}"？`,
        success: (res) => {
          if (res.confirm) {
            markTaskCompleted(task.id);
            Taro.showToast({ title: '任务已完成', icon: 'success' });
          }
        }
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return { month: `${month}月`, day: `${day}日` };
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  const getReadinessLevel = () => {
    if (readiness.total >= 80) return { text: '可上岗', color: styles.levelGood };
    if (readiness.total >= 50) return { text: '学习中', color: styles.levelMedium };
    return { text: '待努力', color: styles.levelBad };
  };

  const readinessLevel = getReadinessLevel();

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'sign': return '📝';
      case 'exam': return '📊';
      case 'practice': return '📖';
      case 'training': return '✅';
      default: return '📌';
    }
  };

  const getTimelineTypeName = (type: string) => {
    switch (type) {
      case 'sign': return '签署';
      case 'exam': return '考核';
      case 'practice': return '练习';
      case 'training': return '补训';
      default: return type;
    }
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

      <View className={styles.readinessSection}>
        <View className={styles.readinessCard}>
          <View className={styles.readinessHeader}>
            <Text className={styles.readinessTitle}>
              <Text className={styles.readinessIcon}>🎯</Text>
              上岗准备度
            </Text>
            <View className={classnames(styles.readinessBadge, readinessLevel.color)}>
              <Text>{readinessLevel.text}</Text>
            </View>
          </View>

          <View className={styles.readinessMain}>
            <View className={styles.readinessScore}>
              <Text className={styles.scoreNum}>{readiness.total}</Text>
              <Text className={styles.scoreMax}>/100</Text>
            </View>
            <View className={styles.readinessProgress}>
              <View
                className={styles.progressFill}
                style={{ width: `${readiness.total}%` }}
              />
            </View>
          </View>

          <View className={styles.readinessItems}>
            {readiness.items.map(item => (
              <View key={item.key} className={styles.readinessItem}>
                <View className={styles.itemLeft}>
                  <Text className={classnames(styles.itemDot, item.done && styles.done)}>
                    {item.done ? '✓' : '○'}
                  </Text>
                  <Text className={styles.itemLabel}>{item.label}</Text>
                </View>
                <Text className={styles.itemScore}>
                  {item.score}/{item.max}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statsGrid}>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{stats.totalExams}</Text>
            <Text className={styles.statsLabel}>考试次数</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{stats.passRate}%</Text>
            <Text className={styles.statsLabel}>通过率</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsValue}>{wrongQuestions.length}</Text>
            <Text className={styles.statsLabel}>待掌握题</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📅</Text>
            档案时间线
          </Text>
          <Text className={styles.sectionMore}>共{timeline.length}条记录</Text>
        </View>
        <View className={styles.timeline}>
          {timeline.map((item, index) => (
            <View
              key={item.id}
              className={classnames(
                styles.timelineItem,
                index === timeline.length - 1 && styles.lastTimelineItem
              )}
              onClick={() => setSelectedTimelineItem(item)}
            >
              <View className={styles.timelineLeft}>
                <View className={styles.timelineDot}>
                  <Text className={styles.timelineDotIcon}>{getTimelineIcon(item.type)}</Text>
                </View>
                {index !== timeline.length - 1 && <View className={styles.timelineLine} />}
              </View>
              <View className={styles.timelineContent}>
                <View className={styles.timelineHeader}>
                  <Text className={styles.timelineDate}>{formatFullDate(item.date)}</Text>
                  <View className={classnames(styles.timelineTag, styles[`tag${item.type}`])}>
                    {getTimelineTypeName(item.type)}
                  </View>
                </View>
                <Text className={styles.timelineTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text className={styles.timelineSubtitle}>{item.subtitle}</Text>
                )}
                <Text className={styles.timelineDetail} numberOfLines={2}>{item.detail}</Text>
              </View>
            </View>
          ))}
          {timeline.length === 0 && (
            <View className={styles.emptyTimeline}>
              <Text className={styles.emptyTimelineIcon}>📋</Text>
              <Text className={styles.emptyTimelineText}>暂无档案记录</Text>
              <Text className={styles.emptyTimelineDesc}>完成考核、签署流程后会自动生成时间线</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>⚠️</Text>
            易错环节
          </Text>
          {weakPoints.length > 0 && (
            <Text className={styles.sectionMore}>
              基于最近{Math.min(examRecords.length, 5)}次考核
            </Text>
          )}
        </View>
        <View className={styles.weakPoints}>
          {weakPoints.length > 0 ? (
            weakPoints.map((point, index) => (
              <Text key={index} className={styles.weakPointTag}>
                {point}
              </Text>
            ))
          ) : (
            <Text style={{ fontSize: '28rpx', color: '#86909C', padding: '16rpx' }}>
              暂无记录，完成考核后自动生成
            </Text>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📚</Text>
            补训任务
          </Text>
          <Text className={styles.sectionMore}>
            {pendingCount} 项待完成
          </Text>
        </View>
        <View className={styles.taskList}>
          {tasks.length > 0 ? (
            tasks.slice(0, 5).map((task: TrainingTask) => (
              <View key={task.id} className={styles.taskItem} onClick={() => handleTaskClick(task)}>
                <View className={classnames(styles.taskIcon, task.status === 'completed' && styles.completed)}>
                  <Text>{task.status === 'completed' ? '✓' : '📋'}</Text>
                </View>
                <View className={styles.taskContent}>
                  <Text className={styles.taskTitle}>{task.title}</Text>
                  <Text className={styles.taskDesc}>{task.description}</Text>
                  <View className={styles.taskMeta}>
                    <Text className={styles.taskDeadline}>截止：{task.deadline}</Text>
                    <Text className={classnames(styles.taskStatus, styles[task.status])}>
                      {task.status === 'completed' ? '已完成' : '点击完成'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: '28rpx', color: '#86909C', padding: '32rpx', textAlign: 'center' }}>
              暂无任务
            </Text>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📊</Text>
            历史成绩
          </Text>
          <Text className={styles.sectionMore}>共{examRecords.length}次</Text>
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
          {examRecords.length === 0 && (
            <Text style={{ fontSize: '28rpx', color: '#86909C', padding: '32rpx', textAlign: 'center' }}>
              暂无考核记录
            </Text>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.signSection}>
          <View className={styles.signHeader}>
            <Text className={styles.signIcon}>📝</Text>
            <Text className={styles.signTitle}>上岗流程确认</Text>
            <Text className={classnames(styles.signStatus, userProfile.signedProcess ? styles.signed : styles.unsigned)}>
              {userProfile.signedProcess ? '已签署' : '待签署'}
            </Text>
          </View>
          <View className={styles.signContent}>
            本人已认真学习消毒追溯流程的所有环节，包括回收、清洗、包装、灭菌、放行的操作规范和质量要求，
            承诺在实际工作中严格遵守相关规定，确保消毒质量和患者安全。
          </View>
          {userProfile.signedProcess && userProfile.signDate && (
            <Text style={{ fontSize: '24rpx', color: '#00B42A', marginBottom: '16rpx' }}>
              签署时间：{formatFullDate(userProfile.signDate)}
            </Text>
          )}
          <View
            className={classnames(styles.signBtn, userProfile.signedProcess && styles.disabled)}
            onClick={() => !userProfile.signedProcess && setShowSignModal(true)}
          >
            <Text>{userProfile.signedProcess ? '已完成签署' : '立即签署'}</Text>
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
              4. 对消毒质量负责{'\n\n'}
              签署后此确认将长期保存在个人档案中。
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

      {selectedTimelineItem && (
        <View className={styles.timelineModal} onClick={() => setSelectedTimelineItem(null)}>
          <View className={styles.timelineModalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.timelineModalHeader}>
              <Text className={styles.timelineModalIcon}>{getTimelineIcon(selectedTimelineItem.type)}</Text>
              <Text className={styles.timelineModalTitle}>档案详情</Text>
              <Text className={styles.timelineModalClose} onClick={() => setSelectedTimelineItem(null)}>✕</Text>
            </View>
            <ScrollView scrollY style={{ maxHeight: '60vh' }}>
              <View className={styles.timelineModalBody}>
                <View className={styles.timelineModalRow}>
                  <Text className={styles.rowLabel}>日期</Text>
                  <Text className={styles.rowValue}>{formatFullDate(selectedTimelineItem.date)}</Text>
                </View>
                <View className={styles.timelineModalRow}>
                  <Text className={styles.rowLabel}>类型</Text>
                  <Text className={styles.rowValue}>{getTimelineTypeName(selectedTimelineItem.type)}</Text>
                </View>
                <View className={styles.timelineModalRow}>
                  <Text className={styles.rowLabel}>标题</Text>
                  <Text className={styles.rowValue}>{selectedTimelineItem.title}</Text>
                </View>
                {selectedTimelineItem.subtitle && (
                  <View className={styles.timelineModalRow}>
                    <Text className={styles.rowLabel}>摘要</Text>
                    <Text className={styles.rowValue}>{selectedTimelineItem.subtitle}</Text>
                  </View>
                )}

                {selectedTimelineItem.examRecord && (
                  <View className={styles.detailSection}>
                    <Text className={styles.detailSectionTitle}>考核详情</Text>
                    <View className={styles.detailStatsRow}>
                      <View className={styles.detailStat}>
                        <Text className={styles.detailStatValue}>{selectedTimelineItem.examRecord.score}</Text>
                        <Text className={styles.detailStatLabel}>分数</Text>
                      </View>
                      <View className={styles.detailStat}>
                        <Text className={styles.detailStatValue}>
                          {selectedTimelineItem.examRecord.correctCount}/{selectedTimelineItem.examRecord.totalQuestions}
                        </Text>
                        <Text className={styles.detailStatLabel}>正确</Text>
                      </View>
                      <View className={styles.detailStat}>
                        <Text className={styles.detailStatValue}>
                          {Math.floor(selectedTimelineItem.examRecord.duration / 60)}分{selectedTimelineItem.examRecord.duration % 60}秒
                        </Text>
                        <Text className={styles.detailStatLabel}>用时</Text>
                      </View>
                    </View>
                    <View className={styles.detailBlock}>
                      <Text className={styles.detailBlockLabel}>薄弱环节分类</Text>
                      <View className={styles.detailTags}>
                        {selectedTimelineItem.examRecord.wrongCategories.length > 0 ? (
                          selectedTimelineItem.examRecord.wrongCategories.map(cat => (
                            <Text key={cat} className={styles.detailTag}>{cat}</Text>
                          ))
                        ) : (
                          <Text style={{ fontSize: '28rpx', color: '#00B42A' }}>全部掌握，无薄弱环节</Text>
                        )}
                      </View>
                    </View>
                    <View className={styles.detailBlock}>
                      <Text className={styles.detailBlockLabel}>错题数量</Text>
                      <Text className={styles.detailBlockValue}>
                        {selectedTimelineItem.examRecord.wrongQuestionIds.length} 道
                      </Text>
                    </View>
                  </View>
                )}

                {selectedTimelineItem.trainingTask && (
                  <View className={styles.detailSection}>
                    <Text className={styles.detailSectionTitle}>补训详情</Text>
                    <View className={styles.detailBlock}>
                      <Text className={styles.detailBlockLabel}>任务名称</Text>
                      <Text className={styles.detailBlockValue}>
                        {selectedTimelineItem.trainingTask.title}
                      </Text>
                    </View>
                    <View className={styles.detailBlock}>
                      <Text className={styles.detailBlockLabel}>任务描述</Text>
                      <Text className={styles.detailBlockValue}>
                        {selectedTimelineItem.trainingTask.description}
                      </Text>
                    </View>
                    <View className={styles.detailBlock}>
                      <Text className={styles.detailBlockLabel}>创建时间</Text>
                      <Text className={styles.detailBlockValue}>
                        {formatFullDate(selectedTimelineItem.trainingTask.createdAt)}
                      </Text>
                    </View>
                    <View className={styles.detailBlock}>
                      <Text className={styles.detailBlockLabel}>完成状态</Text>
                      <Text className={classnames(styles.detailBlockValue, { [styles.successText]: selectedTimelineItem.trainingTask.status === 'completed' })}>
                        {selectedTimelineItem.trainingTask.status === 'completed' ? '已完成' : '进行中'}
                      </Text>
                    </View>
                  </View>
                )}

                <View className={styles.detailBlock}>
                  <Text className={styles.detailBlockLabel}>备注</Text>
                  <Text className={styles.detailBlockValue}>{selectedTimelineItem.detail}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfilePage;
