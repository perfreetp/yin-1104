export default defineAppConfig({
  pages: [
    'pages/process-study/index',
    'pages/simulation/index',
    'pages/error-correction/index',
    'pages/shift-exam/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#00A870',
    navigationBarTitleText: '消毒追溯培训',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#00A870',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/process-study/index',
        text: '流程学习'
      },
      {
        pagePath: 'pages/simulation/index',
        text: '模拟录入'
      },
      {
        pagePath: 'pages/error-correction/index',
        text: '错题纠偏'
      },
      {
        pagePath: 'pages/shift-exam/index',
        text: '班次考核'
      },
      {
        pagePath: 'pages/profile/index',
        text: '个人档案'
      }
    ]
  }
})
