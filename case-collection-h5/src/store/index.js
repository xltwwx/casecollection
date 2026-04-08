import { reactive } from 'vue'
import wx from '../utils/wx-api'

// 初始化数据
const initData = () => {
  const storedCases = wx.getStorageSync('cases')
  if (storedCases) {
    return storedCases
  } else {
    // 初始化模拟数据
    const initialCases = [
      {
        id: '1',
        name: '某科技公司经营贷调查',
        customerName: '张三',
        customerId: '',
        businessType: '正常',
        duration: '12:45',
        date: '2026-03-08',
        type: '正常',
        intro: { title: '张三经营贷', time: '2026-03-08', customerName: '张三', customerType: '个人', industry: 'IT', amount: '100 万' },
        customerInfo: { family: '三口之家', business: '软件开发', assetsLiabilities: '房产 1 套' },
        loanScheme: { rate: '3.8%', term: '3 年', guarantee: '抵押', repayment: '先息后本' },
        investigation: { offSite: '征信良好', onSite: '经营场所真实' },
        decisionFocus: '现金流稳定性较好，但行业竞争激烈。',
        recordings: {}
      },
      {
        id: '2',
        name: '李四小微企业贷款申请',
        customerName: '李四',
        customerId: '',
        businessType: '纠结',
        duration: '08:20',
        date: '2026-03-07',
        type: '纠结',
        intro: { title: '李四小微贷', time: '2026-03-07', customerName: '李四', customerType: '企业', industry: '餐饮', amount: '50 万' },
        customerInfo: { family: '已婚', business: '快餐店', assetsLiabilities: '负债率 40%' },
        loanScheme: { rate: '4.2%', term: '1 年', guarantee: '信用', repayment: '等额本息' },
        investigation: { offSite: '流水波动大', onSite: '客流量一般' },
        decisionFocus: '利润率偏低，抗风险能力弱。',
        recordings: {}
      },
      {
        id: '3',
        name: '王五农业贷款拒贷分析',
        customerName: '王五',
        customerId: '',
        businessType: '拒贷',
        duration: '15:10',
        date: '2026-03-05',
        type: '拒贷',
        intro: { title: '王五农业贷', time: '2026-03-05', customerName: '王五', customerType: '农户', industry: '养殖', amount: '200 万' },
        customerInfo: { family: '五口之家', business: '养猪场', assetsLiabilities: '无抵押物' },
        loanScheme: { rate: '4.5%', term: '2 年', guarantee: '担保', repayment: '到期一次性' },
        investigation: { offSite: '有逾期记录', onSite: '环境不合规' },
        decisionFocus: '征信瑕疵且抵押不足。',
        recordings: {}
      },
      {
        id: '4',
        name: '赵六房产抵押贷逾期处理',
        customerName: '赵六',
        customerId: '',
        businessType: '逾期',
        duration: '22:30',
        date: '2026-03-01',
        type: '逾期',
        intro: { title: '赵六抵押贷', time: '2026-03-01', customerName: '赵六', customerType: '个人', industry: '商贸', amount: '300 万' },
        customerInfo: { family: '离异', business: '建材批发', assetsLiabilities: '资不抵债' },
        loanScheme: { rate: '4.0%', term: '5 年', guarantee: '房产', repayment: '等额本金' },
        investigation: { offSite: '多头借贷', onSite: '库存积压' },
        decisionFocus: '市场需求萎缩，回款周期过长。',
        recordings: {}
      }
    ]
    wx.setStorageSync('cases', initialCases)
    return initialCases
  }
}

const store = reactive({
  cases: initData(),
  
  // 获取所有案例（已排序）
  getCases() {
    return [...this.cases].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  },
  
  // 根据 ID 获取案例
  getCaseById(id) {
    return this.cases.find(c => c.id === id)
  },
  
  // 保存案例
  saveCase(caseData) {
    const existingIndex = this.cases.findIndex(c => c.id === caseData.id)
    if (existingIndex >= 0) {
      this.cases[existingIndex] = caseData
    } else {
      this.cases.unshift(caseData)
    }
    wx.setStorageSync('cases', this.cases)
  },
  
  // 刷新数据
  refreshCases() {
    const storedCases = wx.getStorageSync('cases')
    if (storedCases) {
      this.cases = storedCases
    }
  }
})

export default store
