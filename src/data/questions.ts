import { Question, WrongQuestion } from '@/types'

export const questions: Question[] = [
  {
    id: 'q1',
    type: 'single',
    question: '使用后的高速手机，第一步应该做什么？',
    options: [
      '直接放入回收筐',
      '踩脚控冲洗30秒后再回收',
      '用酒精棉球擦拭',
      '拆下轴承清洗'
    ],
    answer: 1,
    explanation: '高速手机使用后应立即踩脚控冲洗30秒，冲净手机内部水道和气道的残留碎屑，再进行回收处理。',
    category: '回收',
    difficulty: 'easy',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q2',
    type: 'single',
    question: '压力蒸汽灭菌的标准温度和时间是？',
    options: [
      '121℃ 10分钟',
      '134℃ 4分钟',
      '132℃ 8分钟',
      '126℃ 15分钟'
    ],
    answer: 1,
    explanation: '预真空压力蒸汽灭菌标准参数为134℃，4分钟，2.1bar。下排气式为121℃，20分钟。',
    category: '灭菌',
    difficulty: 'medium',
    forRoles: ['disinfector', 'nurse']
  },
  {
    id: 'q3',
    type: 'multiple',
    question: '灭菌后物品放行前需要检查哪些项目？（多选）',
    options: [
      '物理参数（温度、压力、时间）',
      '化学指示卡变色情况',
      '包装完整性',
      '生物监测结果'
    ],
    answer: [0, 1, 2, 3],
    explanation: '灭菌后物品放行必须进行：物理监测（温度、压力、时间）、化学监测（包外胶带、包内指示卡）、生物监测（每周一次或植入物每锅）、包装完整性检查。',
    category: '放行',
    difficulty: 'medium',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q4',
    type: 'judge',
    question: '清洗后的器械可以直接包装灭菌，不需要检查清洁度。',
    options: ['正确', '错误'],
    answer: 1,
    explanation: '错误。清洗后的器械必须检查清洁度，确保无血迹、无污垢、关节灵活，不合格的需要重新清洗。',
    category: '清洗',
    difficulty: 'easy',
    forRoles: ['disinfector', 'nurse']
  },
  {
    id: 'q5',
    type: 'scenario',
    question: '【情景题】你在包装器械包时，发现包内的止血钳少了一把，但是外包装已经封好了。你应该怎么做？',
    options: [
      '拆开包装，补齐器械后重新包装',
      '直接放行，少一把没关系',
      '在包装上备注少一把，继续使用',
      '放入备用的其他型号钳子'
    ],
    answer: 0,
    explanation: '必须拆开包装，补齐器械后重新包装灭菌。器械包内容物必须准确无误，否则会影响临床使用，也不符合追溯管理要求。',
    category: '包装',
    difficulty: 'medium',
    forRoles: ['disinfector', 'nurse']
  },
  {
    id: 'q6',
    type: 'scenario',
    question: '【情景题】灭菌进行到一半时，突然停电了，此时已经灭菌了2分钟。来电后应该如何处理？',
    options: [
      '继续灭菌到4分钟即可',
      '重新开始完整的灭菌程序',
      '直接放出来电后再灭一次',
      '延长灭菌时间2分钟'
    ],
    answer: 1,
    explanation: '中断的灭菌程序无效，必须重新开始完整的灭菌程序。因为灭菌过程中温度下降可能导致细菌复苏，不能简单累加时间。',
    category: '灭菌',
    difficulty: 'hard',
    forRoles: ['disinfector', 'nurse']
  },
  {
    id: 'q7',
    type: 'single',
    question: '纸塑包装袋封口宽度应不小于多少？',
    options: [
      '3mm',
      '6mm',
      '10mm',
      '15mm'
    ],
    answer: 1,
    explanation: '纸塑包装袋封口宽度应不小于6mm，确保封口密闭，防止灭菌后二次污染。',
    category: '包装',
    difficulty: 'easy',
    forRoles: ['disinfector', 'nurse']
  },
  {
    id: 'q8',
    type: 'single',
    question: '无菌物品存放架应距地面多少距离？',
    options: [
      '10cm',
      '20cm',
      '30cm',
      '50cm'
    ],
    answer: 1,
    explanation: '无菌物品存放架应距地面≥20cm，距墙≥5cm，距天花板≥50cm，防止地面潮湿和墙壁潮气污染。',
    category: '放行',
    difficulty: 'easy',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q9',
    type: 'multiple',
    question: '器械清洗的目的包括哪些？（多选）',
    options: [
      '去除肉眼可见的污物',
      '杀灭所有细菌',
      '减少微生物数量',
      '保证灭菌效果'
    ],
    answer: [0, 2, 3],
    explanation: '清洗的目的是去除有机物、减少微生物数量，为后续灭菌创造条件。但清洗不能杀灭所有细菌，灭菌才能达到无菌水平。',
    category: '清洗',
    difficulty: 'medium',
    forRoles: ['disinfector', 'nurse']
  },
  {
    id: 'q10',
    type: 'judge',
    question: '使用后的针头等尖锐物品应直接放入黄色医疗垃圾袋。',
    options: ['正确', '错误'],
    answer: 1,
    explanation: '错误。尖锐物品应放入防刺破的利器盒中，防止刺伤和交叉感染，不能直接放入垃圾袋。',
    category: '回收',
    difficulty: 'easy',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q11',
    type: 'single',
    question: '生物监测的频率是？',
    options: [
      '每天一次',
      '每周一次',
      '每月一次',
      '每季度一次'
    ],
    answer: 1,
    explanation: '生物监测应每周进行一次。植入物灭菌应每锅进行生物监测，结果阴性方可放行。',
    category: '灭菌',
    difficulty: 'medium',
    forRoles: ['disinfector', 'nurse']
  },
  {
    id: 'q12',
    type: 'scenario',
    question: '【情景题】你在整理无菌物品时，发现一个无菌包包装破损了，但还在有效期内。你应该怎么做？',
    options: [
      '继续使用，不影响',
      '用胶带粘好继续用',
      '重新清洗包装灭菌',
      '放到最外面尽快用掉'
    ],
    answer: 2,
    explanation: '包装破损意味着无菌屏障已被破坏，即使在有效期内也不能使用，必须重新清洗、包装、灭菌。',
    category: '放行',
    difficulty: 'medium',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q13',
    type: 'single',
    question: '高压灭菌器排出的冷凝水中有污物，最可能的原因是？',
    options: [
      '灭菌器坏了',
      '器械清洗不彻底',
      '灭菌时间不够',
      '温度太高'
    ],
    answer: 1,
    explanation: '冷凝水中有污物说明器械清洗不彻底，残留的有机物被冲出。必须加强清洗质量管控。',
    category: '清洗',
    difficulty: 'medium',
    forRoles: ['disinfector']
  },
  {
    id: 'q14',
    type: 'multiple',
    question: '追溯记录应包含哪些内容？（多选）',
    options: [
      '器械名称和数量',
      '灭菌批次号和日期',
      '操作人员',
      '灭菌参数'
    ],
    answer: [0, 1, 2, 3],
    explanation: '完整的追溯记录应包括：器械信息、灭菌批次、灭菌参数（温度、压力、时间）、操作人员、患者使用信息等，确保可双向追溯。',
    category: '放行',
    difficulty: 'medium',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q15',
    type: 'single',
    question: '消毒员的主要职责不包括以下哪项？',
    options: [
      '操作灭菌设备',
      '记录灭菌参数',
      '给患者治疗',
      '设备日常维护'
    ],
    answer: 2,
    explanation: '消毒员负责消毒灭菌相关工作，包括设备操作、参数记录、设备维护等，不包括临床治疗操作。',
    category: '其他',
    difficulty: 'easy',
    forRoles: ['disinfector']
  },
  {
    id: 'q16',
    type: 'single',
    question: '护士接收无菌物品时，首先检查什么？',
    options: [
      '物品数量是否正确',
      '包装完整性和有效期',
      '物品型号是否对',
      '存放位置是否正确'
    ],
    answer: 1,
    explanation: '护士接收无菌物品时，首先应检查包装完整性、化学指示物变色情况和有效期，确保无菌状态可靠。',
    category: '临床交接',
    difficulty: 'easy',
    forRoles: ['nurse']
  },
  {
    id: 'q17',
    type: 'single',
    question: '患者使用后的器械交接时，护士应该重点说明什么？',
    options: [
      '器械的品牌',
      '有无特殊感染或血液污染情况',
      '器械的购买价格',
      '患者的个人信息'
    ],
    answer: 1,
    explanation: '使用后器械交接时，护士应重点说明有无特殊感染情况，以便消毒员采取相应的消毒隔离措施。',
    category: '临床交接',
    difficulty: 'medium',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q18',
    type: 'multiple',
    question: '器械回收时应注意哪些事项？（多选）',
    options: [
      '分类放置，避免碰撞',
      '尖锐物品放入利器盒',
      '有特殊感染需标识并双层包装',
      '先在诊室进行初步清洗'
    ],
    answer: [0, 1, 2],
    explanation: '回收时应分类放置、尖锐物品入利器盒、特殊感染标识处理。不应在诊室进行清洗，防止气溶胶扩散。',
    category: '回收',
    difficulty: 'medium',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q19',
    type: 'single',
    question: '全自动清洗消毒器的推荐水温是？',
    options: [
      '预洗30℃，主洗45-60℃',
      '预洗60℃，主洗90℃',
      '全程90℃',
      '全程常温'
    ],
    answer: 0,
    explanation: '全自动清洗消毒器推荐：预洗30℃防止蛋白凝固，主洗45-60℃配合酶洗剂，消毒阶段90℃以上。',
    category: '清洗',
    difficulty: 'medium',
    forRoles: ['disinfector']
  },
  {
    id: 'q20',
    type: 'single',
    question: '灭菌包的最大重量和体积分别是？',
    options: [
      '3kg，20×20×30cm',
      '5kg，25×25×40cm',
      '7kg，30×30×50cm',
      '10kg，40×40×60cm'
    ],
    answer: 2,
    explanation: '灭菌包重量不宜超过7kg，体积不宜超过30×30×50cm，确保蒸汽能充分穿透。',
    category: '包装',
    difficulty: 'medium',
    forRoles: ['disinfector']
  },
  {
    id: 'q21',
    type: 'judge',
    question: '植入物灭菌后，生物监测结果出来前可以先放行使用。',
    options: ['正确', '错误'],
    answer: 1,
    explanation: '错误。植入物必须每锅进行生物监测，结果阴性后方可放行。紧急情况需记录并追溯。',
    category: '灭菌',
    difficulty: 'medium',
    forRoles: ['disinfector', 'nurse']
  },
  {
    id: 'q22',
    type: 'scenario',
    question: '【情景题】护士准备使用一个无菌包，打开后发现包内指示卡变色不均匀。你建议她怎么做？',
    options: [
      '继续使用，外包装没问题就行',
      '停止使用，退回消毒室重新处理',
      '用酒精擦一下继续用',
      '放在旁边晾一下再用'
    ],
    answer: 1,
    explanation: '包内指示卡变色不均匀说明灭菌可能不达标，必须停止使用，退回消毒室重新清洗包装灭菌。',
    category: '临床交接',
    difficulty: 'medium',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q23',
    type: 'single',
    question: '第五类化学指示卡的特点是？',
    options: [
      '只监测温度',
      '监测温度和时间',
      '监测温度、时间和饱和蒸汽',
      '只监测压力'
    ],
    answer: 2,
    explanation: '第五类（综合）化学指示卡模拟生物指示剂，监测灭菌全过程的关键参数：温度、时间和饱和蒸汽。',
    category: '灭菌',
    difficulty: 'hard',
    forRoles: ['disinfector']
  },
  {
    id: 'q24',
    type: 'multiple',
    question: '无菌物品存放要求包括哪些？（多选）',
    options: [
      '距地面≥20cm',
      '距墙≥5cm',
      '距天花板≥50cm',
      '按失效期先后顺序存放'
    ],
    answer: [0, 1, 2, 3],
    explanation: '无菌物品存放：距地面≥20cm、距墙≥5cm、距天花板≥50cm，按失效期先后顺序左进右出、先进先出。',
    category: '放行',
    difficulty: 'medium',
    forRoles: ['nurse', 'disinfector']
  },
  {
    id: 'q25',
    type: 'single',
    question: '手工清洗器械时，正确的刷洗方式是？',
    options: [
      '在液面下刷洗，水流从脏端流向净端',
      '在空气中刷洗，便于观察',
      '来回大力刷洗',
      '用热水直接冲洗即可'
    ],
    answer: 0,
    explanation: '手工刷洗必须在液面下进行，防止产生气溶胶，水流方向从脏端流向净端。',
    category: '清洗',
    difficulty: 'medium',
    forRoles: ['disinfector']
  }
]

export const initialWrongQuestions: WrongQuestion[] = [
  {
    ...questions[1],
    wrongCount: 3,
    lastWrongTime: new Date().toISOString().split('T')[0]
  },
  {
    ...questions[4],
    wrongCount: 2,
    lastWrongTime: new Date().toISOString().split('T')[0]
  },
  {
    ...questions[5],
    wrongCount: 4,
    lastWrongTime: new Date().toISOString().split('T')[0]
  },
  {
    ...questions[8],
    wrongCount: 1,
    lastWrongTime: new Date().toISOString().split('T')[0]
  },
  {
    ...questions[11],
    wrongCount: 2,
    lastWrongTime: new Date().toISOString().split('T')[0]
  }
]

export const scenarioQuestions: Question[] = questions.filter(q => q.type === 'scenario')
