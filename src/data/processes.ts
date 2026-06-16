import { InstrumentType } from '@/types'

export const instrumentTypes: InstrumentType[] = [
  {
    id: '1',
    name: '高速手机',
    category: '手机类',
    icon: '🔧',
    steps: [
      {
        id: 's1',
        title: '回收',
        key: 'recycle',
        description: '使用后立即进行初步处理，防止污物干涸',
        keyPoints: [
          '使用后立即踩脚控冲洗30秒',
          '卸下手机，用湿棉球擦拭表面',
          '放入专用回收容器',
          '填写回收记录：器械名称、数量、使用科室'
        ],
        duration: '5分钟'
      },
      {
        id: 's2',
        title: '清洗',
        key: 'clean',
        description: '彻底清除有机物和微生物，是灭菌成功的前提',
        keyPoints: [
          '使用专用手机清洗润滑剂',
          '连接清洗接口，启动清洗程序',
          '选择牙科手机清洗模式（95℃，5分钟）',
          '清洗后检查手机外表及内腔清洁度',
          '吹干手机表面及气道、水道'
        ],
        duration: '15分钟'
      },
      {
        id: 's3',
        title: '包装',
        key: 'pack',
        description: '保持灭菌后物品的无菌状态，防止二次污染',
        keyPoints: [
          '向手机内腔注入专用润滑油',
          '安装手机保护套',
          '选用合适大小的纸塑包装袋',
          '放入第五类化学指示卡',
          '封口宽度≥6mm，检查封口完整性',
          '标注：器械名称、批次号、灭菌日期、失效期、操作者'
        ],
        duration: '10分钟'
      },
      {
        id: 's4',
        title: '灭菌',
        key: 'sterilize',
        description: '使用压力蒸汽灭菌，杀灭所有微生物包括芽孢',
        keyPoints: [
          '将纸塑包装纸面向下、塑面向上放置',
          '包与包之间留间隙，便于蒸汽穿透',
          '选择134℃预真空灭菌程序',
          '灭菌参数：温度134℃，压力2.1bar，时间4分钟',
          '记录灭菌参数：温度、压力、时间',
          '放置生物指示剂进行批量监测'
        ],
        duration: '30分钟'
      },
      {
        id: 's5',
        title: '放行',
        key: 'release',
        description: '灭菌结束后检查确认，合格方可放行使用',
        keyPoints: [
          '检查物理参数：温度、时间、压力均合格',
          '检查化学指示卡变色情况：由米色变为黑色',
          '检查包装完整性：无破损、无潮湿、封口完好',
          '生物监测结果阴性方可放行',
          '记录放行人员、放行时间、灭菌批次',
          '存放于无菌物品存放柜，距地面≥20cm'
        ],
        duration: '5分钟'
      }
    ]
  },
  {
    id: '2',
    name: '拔牙器械',
    category: '手术器械',
    icon: '🦷',
    steps: [
      {
        id: 's1',
        title: '回收',
        key: 'recycle',
        description: '使用后及时回收，避免血液干涸',
        keyPoints: [
          '使用后立即用流动水初步冲洗表面血迹',
          '将器械关节打开，放入专用回收筐',
          '尖锐器械放入防刺容器',
          '记录：器械名称、数量、使用患者信息',
          '有特殊感染需标注并双层包装'
        ],
        duration: '5分钟'
      },
      {
        id: 's2',
        title: '清洗',
        key: 'clean',
        description: '彻底清除血迹、组织等有机物',
        keyPoints: [
          '先手工初步刷洗：在液面下刷洗，防止气溶胶',
          '使用医用酶清洗剂，水温15-30℃',
          '放入超声清洗机：频率40kHz，时间5-10分钟',
          '然后放入全自动清洗消毒器',
          '选择器械清洗程序：90℃，5分钟消毒',
          '清洗后检查：关节、齿牙处无血迹、无污垢'
        ],
        duration: '30分钟'
      },
      {
        id: 's3',
        title: '包装',
        key: 'pack',
        description: '正确包装，保持灭菌后无菌状态',
        keyPoints: [
          '检查器械清洁度和功能：关节灵活、咬合良好',
          '器械关节打开，尖端套上保护套',
          '包内放置化学指示卡',
          '使用双层棉布或无纺布包装',
          '用化学指示胶带封包',
          '标注：器械包名称、批次号、灭菌日期、失效期、操作者'
        ],
        duration: '15分钟'
      },
      {
        id: 's4',
        title: '灭菌',
        key: 'sterilize',
        description: '压力蒸汽灭菌确保灭菌效果',
        keyPoints: [
          '包体积不超过30×30×50cm',
          '重量不超过7kg',
          '竖直放置，包间留间隙',
          '选择121℃下排气或132-134℃预真空',
          '灭菌时间：121℃ 20分钟 / 134℃ 4分钟',
          '每锅放置工艺监测、化学监测、生物监测'
        ],
        duration: '45分钟'
      },
      {
        id: 's5',
        title: '放行',
        key: 'release',
        description: '严格检查，合格后方可放行',
        keyPoints: [
          '物理参数监测合格（温度、压力、时间）',
          '化学指示胶带变色均匀',
          '包外化学指示物变色合格',
          '包内化学指示卡变色达到合格标准',
          '生物监测阴性',
          '包装完整、干燥、无破损',
          '记录：灭菌批次、放行时间、放行人员签名'
        ],
        duration: '5分钟'
      }
    ]
  },
  {
    id: '3',
    name: '口镜/镊子/探针',
    category: '检查器械',
    icon: '🔍',
    steps: [
      {
        id: 's1',
        title: '回收',
        key: 'recycle',
        description: '使用后集中回收',
        keyPoints: [
          '使用后放入专用回收托盘',
          '避免碰撞，防止尖端损坏',
          '按器械类型分类放置',
          '记录数量和使用科室'
        ],
        duration: '3分钟'
      },
      {
        id: 's2',
        title: '清洗',
        key: 'clean',
        description: '彻底清洗确保无残留',
        keyPoints: [
          '使用全自动清洗消毒器',
          '器械摆放：尖端朝上，关节打开',
          '选择标准器械清洗程序',
          '水温：预洗30℃，主洗45-60℃',
          '消毒温度90℃以上，时间≥1分钟',
          '最后进行干燥处理'
        ],
        duration: '25分钟'
      },
      {
        id: 's3',
        title: '包装',
        key: 'pack',
        description: '按套件包装便于使用',
        keyPoints: [
          '检查器械清洁度和完好性',
          '按口镜、镊子、探针三件套包装',
          '尖端使用保护套',
          '放置化学指示卡',
          '使用纸塑袋包装',
          '标注：器械名称、数量、灭菌日期'
        ],
        duration: '8分钟'
      },
      {
        id: 's4',
        title: '灭菌',
        key: 'sterilize',
        description: '快速程序提高周转',
        keyPoints: [
          '纸塑包装纸面朝下放置',
          '选择134℃快速灭菌程序',
          '灭菌时间：4分钟',
          '干燥时间：10分钟',
          '记录灭菌参数'
        ],
        duration: '20分钟'
      },
      {
        id: 's5',
        title: '放行',
        key: 'release',
        description: '检查合格后放行',
        keyPoints: [
          '检查化学指示卡变色',
          '包装完整无损',
          '无湿包现象',
          '扫码录入追溯系统',
          '按有效期顺序存放'
        ],
        duration: '3分钟'
      }
    ]
  },
  {
    id: '4',
    name: '车针/锉针',
    category: '耗材类',
    icon: '💉',
    steps: [
      {
        id: 's1',
        title: '回收',
        key: 'recycle',
        description: '使用后集中回收，防止刺伤',
        keyPoints: [
          '使用后放入利器盒',
          '统一收集到专用回收容器',
          '不同型号分类放置',
          '记录数量和使用情况'
        ],
        duration: '2分钟'
      },
      {
        id: 's2',
        title: '清洗',
        key: 'clean',
        description: '仔细清洗每一根车针',
        keyPoints: [
          '先用毛刷在液面下刷洗',
          '放入超声清洗机清洗10分钟',
          '使用车针清洗架固定',
          '冲洗干净后干燥',
          '检查：针刃锋利、无裂纹、无变形'
        ],
        duration: '20分钟'
      },
      {
        id: 's3',
        title: '包装',
        key: 'pack',
        description: '小包装便于使用',
        keyPoints: [
          '按型号分类，每包5-10支',
          '放入专用车针盒',
          '放置化学指示物',
          '纸塑袋包装封口',
          '标注型号、数量、灭菌日期'
        ],
        duration: '10分钟'
      },
      {
        id: 's4',
        title: '灭菌',
        key: 'sterilize',
        description: '确保灭菌效果',
        keyPoints: [
          '放置于灭菌架上层',
          '134℃预真空灭菌',
          '保持干燥时间充足',
          '记录灭菌参数',
          '批量放置生物指示剂'
        ],
        duration: '30分钟'
      },
      {
        id: 's5',
        title: '放行',
        key: 'release',
        description: '严格质控后放行',
        keyPoints: [
          '物理参数合格',
          '化学指示物变色合格',
          '包装完整',
          '生物监测结果合格',
          '登记发放记录'
        ],
        duration: '3分钟'
      }
    ]
  },
  {
    id: '5',
    name: '印模托盘',
    category: '修复器械',
    icon: '📐',
    steps: [
      {
        id: 's1',
        title: '回收',
        key: 'recycle',
        description: '使用后及时回收处理',
        keyPoints: [
          '使用后去除托盘表面印模材料',
          '放入专用回收容器',
          '按型号分类',
          '记录使用情况'
        ],
        duration: '3分钟'
      },
      {
        id: 's2',
        title: '清洗',
        key: 'clean',
        description: '彻底清洁残留印模材料',
        keyPoints: [
          '手工初步刷洗',
          '使用专用托盘清洗剂浸泡',
          '超声清洗5-10分钟',
          '流动水冲净',
          '检查内外表面清洁，无残留印模材料',
          '干燥备用'
        ],
        duration: '20分钟'
      },
      {
        id: 's3',
        title: '包装',
        key: 'pack',
        description: '独立包装防止污染',
        keyPoints: [
          '检查托盘清洁完好',
          '单个包装或成套包装',
          '放置化学指示卡',
          '使用纸塑袋包装',
          '标注：托盘型号、数量、灭菌日期'
        ],
        duration: '5分钟'
      },
      {
        id: 's4',
        title: '灭菌',
        key: 'sterilize',
        description: '选择合适的灭菌方式',
        keyPoints: [
          '金属托盘：压力蒸汽灭菌134℃',
          '塑料托盘：低温等离子灭菌',
          '按材质选择灭菌程序',
          '记录灭菌参数',
          '注意托盘不可堆叠过密'
        ],
        duration: '30分钟'
      },
      {
        id: 's5',
        title: '放行',
        key: 'release',
        description: '检查合格后发放',
        keyPoints: [
          '物理监测、化学监测合格',
          '包装完好无破损',
          '无湿包',
          '登记发放',
          '存放于无菌柜'
        ],
        duration: '3分钟'
      }
    ]
  }
]

export const stepKeys = [
  { key: 'recycle', title: '回收', color: '#1677FF', icon: '♻️' },
  { key: 'clean', title: '清洗', color: '#00B42A', icon: '🚿' },
  { key: 'pack', title: '包装', color: '#FF7D00', icon: '📦' },
  { key: 'sterilize', title: '灭菌', color: '#F53F3F', icon: '🔥' },
  { key: 'release', title: '放行', color: '#722ED1', icon: '✅' }
]
