const api = require('../../../utils/api')
const auth = require('../../../utils/auth')
const utils = require('../../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 筛选相关
    currentFilter: 'all',
    filterTabs: [
      { id: 'all', title: '全部', count: 0 },
      { id: 'completed', title: '已完成', count: 0 },
      { id: 'pending', title: '处理中', count: 0 },
      { id: 'cancelled', title: '已取消', count: 0 }
    ],
    
    // 统计数据
    totalRedemptions: 0,
    totalPointsUsed: 0,
    thisMonthRedemptions: 0,
    
    // 记录数据
    allRecords: [],
    filteredRecords: [],
    
    // 分页
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    
    // 空状态
    emptyStateText: '暂无兑换记录'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('redemption page onLoad')
    this.checkAndLoadData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('redemption page onShow')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadMore()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '孝碳江湖 - 我的兑换记录',
      desc: '查看我的环保商品兑换记录',
      path: '/pages/me/redemption/redemption'
    }
  },

  // 检查登录状态并加载数据
  checkAndLoadData() {
    console.log('检查登录状态')
    
    if (!auth.requireLoginWithRedirect('/pages/me/redemption/redemption', {
      toastTitle: '请先登录后查看兑换记录',
      delay: 1000
    })) {
      return
    }
    
    console.log('用户已登录，加载数据')
    this.loadRedemptionData()
  },

  // 加载兑换记录数据
  async loadRedemptionData() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      console.log('开始加载兑换记录，页码:', this.data.page)
      
      // 获取兑换记录
      const result = await api.getRedemptionRecords({
        page: this.data.page,
        pageSize: this.data.pageSize
      })
      
      console.log('获取兑换记录结果:', result)
      
      if (result.success) {
        const { records, stats } = result.data
        
        // 处理记录数据
        const processedRecords = this.processRecords(records || [])
        const allRecords = this.data.page === 1 ? processedRecords : [...this.data.allRecords, ...processedRecords]
        
        console.log('处理后的兑换记录:', processedRecords)
        
        // 更新统计
        this.updateFilterTabs(allRecords)
        
        this.setData({
          allRecords,
          loading: false,
          hasMore: processedRecords.length >= this.data.pageSize,
          totalRedemptions: (stats && stats.totalRedemptions) || allRecords.length,
          totalPointsUsed: (stats && stats.totalPointsUsed) || this.calculateTotalPoints(allRecords),
          thisMonthRedemptions: (stats && stats.thisMonthRedemptions) || this.calculateThisMonth(allRecords),
        })
        
        // 应用当前筛选
        this.applyFilter()
      } else {
        console.error('获取兑换记录失败:', result.message)
        // 使用模拟数据
        this.loadMockData()
      }
    } catch (error) {
      console.error('加载兑换记录失败:', error)
      this.loadMockData()
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载模拟数据
  loadMockData() {
    const mockRecords = this.generateMockRecords()
    
    this.setData({
      allRecords: mockRecords,
      totalRedemptions: mockRecords.length,
      totalPointsUsed: this.calculateTotalPoints(mockRecords),
      thisMonthRedemptions: this.calculateThisMonth(mockRecords),
      hasMore: false
    })
    
    this.updateFilterTabs(mockRecords)
    this.applyFilter()
  },

  // 生成模拟数据
  generateMockRecords() {
    const products = [
      {
        name: '环保购物袋',
        image: '/static/images/products/eco-bag.jpg',
        points: 500
      },
      {
        name: '竹制牙刷',
        image: '/static/images/products/bamboo-toothbrush.jpg',
        points: 300
      },
      {
        name: '保温水杯',
        image: '/static/images/products/reusable-bottle.jpg',
        points: 800
      },
      {
        name: '有机棉T恤',
        image: '/static/images/products/organic-tshirt.jpg',
        points: 1200
      },
      {
        name: '可降解餐具套装',
        image: '/static/images/products/biodegradable-utensils.jpg',
        points: 600
      }
    ]
    
    const statuses = [
      { id: 'completed', text: '已完成', delivery: 'delivered', deliveryText: '已送达' },
      { id: 'pending', text: '处理中', delivery: 'processing', deliveryText: '处理中' },
      { id: 'completed', text: '已完成', delivery: 'shipped', deliveryText: '已发货' },
      { id: 'cancelled', text: '已取消', delivery: null, deliveryText: null }
    ]
    
    return Array.from({ length: 8 }, (_, index) => {
      const product = products[index % products.length]
      const status = statuses[index % statuses.length]
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 60))
      
      return {
        id: `redemption_${index + 1}`,
        product_name: product.name,
        product_image: product.image,
        points_used: product.points,
        status: status.id,
        statusText: status.text,
        delivery_status: status.delivery,
        deliveryStatusText: status.deliveryText,
        order_no: `RD${Date.now()}${index}`,
        redeem_time: utils.formatTime(date, 'YYYY-MM-DD HH:mm'),
        created_at: date.toISOString()
      }
    })
  },

  // 处理记录数据
  processRecords(records) {
    console.log('处理记录数据，原始数据:', records);
    
    return records.map(record => {
      const statusMap = {
        'completed': '已完成',
        'pending': '处理中',
        'cancelled': '已取消'
      }
      
      const deliveryMap = {
        'delivered': '已送达',
        'shipped': '已发货',
        'processing': '处理中'
      }
      
      // 添加商品图片（如果没有）
      const productImage = record.product_image || record.image || '/static/images/products/eco-bag.jpg';
      
      // 添加订单号（如果没有）
      const orderNo = record.order_no || record._id || `RD${Date.now()}`;
      
      // 处理创建时间
      let redeemTime = record.redeem_time;
      if (!redeemTime && record.createTime) {
        // 处理云开发的时间戳格式
        const createTime = record.createTime.$date ? new Date(record.createTime.$date) : new Date(record.createTime);
        redeemTime = utils.formatTime(createTime, 'YYYY-MM-DD HH:mm');
      }
      
      return {
        id: record._id,
        product_name: record.productName || record.product_name,
        product_image: productImage,
        points_used: record.points || record.points_used,
        status: record.status,
        statusText: statusMap[record.status] || record.status,
        delivery_status: record.delivery_status || 'processing',
        deliveryStatusText: deliveryMap[record.delivery_status] || '处理中',
        order_no: orderNo,
        redeem_time: redeemTime,
        created_at: record.createTime ? (record.createTime.$date ? new Date(record.createTime.$date).toISOString() : new Date(record.createTime).toISOString()) : new Date().toISOString(),
        address: record.address
      }
    })
  },

  // 计算总积分
  calculateTotalPoints(records) {
    return records.reduce((total, record) => total + (record.points_used || 0), 0)
  },

  // 计算本月兑换数
  calculateThisMonth(records) {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return records.filter(record => {
      const date = new Date(record.created_at)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length
  },

  // 更新筛选标签计数
  updateFilterTabs(records) {
    const counts = {
      all: records.length,
      completed: records.filter(r => r.status === 'completed').length,
      pending: records.filter(r => r.status === 'pending').length,
      cancelled: records.filter(r => r.status === 'cancelled').length
    }
    
    const filterTabs = this.data.filterTabs.map(tab => ({
      ...tab,
      count: counts[tab.id] || 0
    }))
    
    this.setData({ filterTabs })
  },

  // 切换筛选
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.applyFilter()
  },

  // 应用筛选
  applyFilter() {
    const { currentFilter, allRecords } = this.data
    
    let filteredRecords = allRecords
    let emptyStateText = '暂无兑换记录'
    
    if (currentFilter !== 'all') {
      filteredRecords = allRecords.filter(record => record.status === currentFilter)
      
      const filterNames = {
        completed: '已完成',
        pending: '处理中',
        cancelled: '已取消'
      }
      emptyStateText = `暂无${filterNames[currentFilter]}的兑换记录`
    }
    
    this.setData({
      filteredRecords,
      emptyStateText
    })
  },

  // 显示记录详情
  showRecordDetail(e) {
    const record = e.currentTarget.dataset.record
    
    let content = `商品：${record.product_name}\n`
    content += `订单号：${record.order_no}\n`
    content += `兑换时间：${record.redeem_time}\n`
    content += `消费积分：${record.points_used}分\n`
    content += `状态：${record.statusText}`
    
    if (record.deliveryStatusText) {
      content += `\n物流状态：${record.deliveryStatusText}`
    }
    
    wx.showModal({
      title: '兑换详情',
      content: content,
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 前往商城
  goToMall() {
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({
      page: this.data.page + 1
    })
    
    this.loadRedemptionData()
  },

  // 刷新数据
  async refreshData() {
    console.log('刷新兑换记录数据')
    
    this.setData({
      page: 1,
      allRecords: [],
      filteredRecords: [],
      hasMore: true
    })
    
    try {
      await this.loadRedemptionData()
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('刷新失败:', error)
      wx.showToast({
        title: '刷新失败',
        icon: 'none'
      })
    }
  },
}) 