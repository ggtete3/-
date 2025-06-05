// pages/activities/records/records.js
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')
const utils = require('../../../utils/utils')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activities: [],
    totalActivities: 0,
    totalPoints: 0,
    totalCarbon: 0,
    loading: false,
    hasMore: true,
    page: 1,
    limit: 10,
    
    // 状态筛选
    selectedStatus: 'all',
    statusOptions: [
      { value: 'all', label: '全部', count: 0 },
      { value: 'pending', label: '审核中', count: 0 },
      { value: 'approved', label: '已通过', count: 0 },
      { value: 'rejected', label: '已拒绝', count: 0 }
    ],
    
    // 筛选相关
    showFilter: false,
    selectedTypes: [],
    startDate: '',
    endDate: '',
    activityTypes: [
      { type: 'bus', name: '公交出行', icon: '/static/icons/bus.png' },
      { type: 'cycling', name: '骑行', icon: '/static/icons/bicycle.png' },
      { type: 'electric_car', name: '新能源车', icon: '/static/icons/car.png' },
      { type: 'electricity', name: '节约用电', icon: '/static/icons/flash.png' },
      { type: 'recycling', name: '垃圾分类', icon: '/static/icons/recycle.png' },
      { type: 'paperless', name: '无纸化办公', icon: '/static/icons/file.png' },
      { type: 'water_saving', name: '节约用水', icon: '/static/icons/droplet.png' },
      { type: 'energy_lamp', name: '节能灯具', icon: '/static/icons/lightbulb.png' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!auth.checkLogin()) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login?redirect=' + encodeURIComponent('/pages/activities/records/records')
        })
      }, 1500)
      return
    }
    
    this.loadActivities()
    this.loadStats()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 检查登录状态
    if (!auth.checkLogin()) {
      wx.navigateBack()
      return
    }
    
    // 刷新数据（可能有新的活动记录）
    this.refreshData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshData()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '孝碳江湖 - 我的环保足迹',
      desc: '记录低碳生活，用行动守护地球！',
      path: '/pages/activities/records/records'
    }
  },

  // 刷新数据
  refreshData() {
    this.setData({
      page: 1,
      activities: [],
      hasMore: true
    })
    this.loadActivities()
    this.loadStats()
  },

  // 加载活动列表
  async loadActivities(loadMore = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const params = {
        page: loadMore ? this.data.page : 1,
        limit: this.data.limit,
        status: this.data.selectedStatus === 'all' ? '' : this.data.selectedStatus,
        types: this.data.selectedTypes.join(','),
        start_date: this.data.startDate,
        end_date: this.data.endDate
      }
      
      const result = await api.getUserActivities(params)
      
      if (result.success) {
        const activities = result.data.activities || []
        const newActivities = loadMore ? 
          [...this.data.activities, ...activities] : 
          activities
          
        this.setData({
          activities: newActivities,
          hasMore: activities.length === this.data.limit,
          page: loadMore ? this.data.page + 1 : 2
        })
        
        // 更新状态统计
        this.updateStatusCounts(result.data.statusCounts)
      } else {
        wx.showToast({
          title: result.message || '加载失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('加载活动记录失败:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const result = await api.getUserActivityStats()
      
      if (result.success) {
        const stats = result.data
        this.setData({
          totalActivities: stats.total_activities || 0,
          totalPoints: stats.total_points || 0,
          totalCarbon: stats.total_carbon || 0
        })
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  },

  // 更新状态统计
  updateStatusCounts(statusCounts) {
    const statusOptions = this.data.statusOptions.map(option => ({
      ...option,
      count: statusCounts[option.value] || 0
    }))
    
    this.setData({ statusOptions })
  },

  // 选择状态筛选
  selectStatus(e) {
    const status = e.currentTarget.dataset.status
    if (status === this.data.selectedStatus) return
    
    this.setData({ selectedStatus: status })
    this.refreshData()
  },

  // 显示筛选弹窗
  showFilterModal() {
    this.setData({ showFilter: true })
  },

  // 隐藏筛选弹窗
  hideFilterModal() {
    this.setData({ showFilter: false })
  },

  // 切换活动类型
  toggleActivityType(e) {
    const type = e.currentTarget.dataset.type
    const selectedTypes = [...this.data.selectedTypes]
    const index = selectedTypes.indexOf(type)
    
    if (index > -1) {
      selectedTypes.splice(index, 1)
    } else {
      selectedTypes.push(type)
    }
    
    this.setData({ selectedTypes })
  },

  // 选择开始日期
  selectStartDate(e) {
    this.setData({ startDate: e.detail.value })
  },

  // 选择结束日期
  selectEndDate(e) {
    this.setData({ endDate: e.detail.value })
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      selectedTypes: [],
      startDate: '',
      endDate: ''
    })
  },

  // 应用筛选
  applyFilter() {
    this.hideFilterModal()
    this.refreshData()
  },

  // 加载更多
  loadMore() {
    this.loadActivities(true)
  },

  // 查看活动详情
  viewActivityDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({
      title: '活动详情功能开发中',
      icon: 'none'
    })
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: [url],
      current: url
    })
  },

  // 跳转到活动提交
  goToSubmitActivity() {
    wx.navigateTo({
      url: '/pages/activities/submit/submit'
    })
  },

  // 获取活动图标
  getActivityIcon(type) {
    const activityType = this.data.activityTypes.find(item => item.type === type)
    return activityType ? activityType.icon : '/static/icons/default.png'
  },

  // 获取活动名称
  getActivityName(type) {
    const activityType = this.data.activityTypes.find(item => item.type === type)
    return activityType ? activityType.name : '未知活动'
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'pending': '审核中',
      'approved': '已通过',
      'rejected': '已拒绝'
    }
    return statusMap[status] || status
  },

  // 格式化日期
  formatDate(dateStr) {
    return utils.formatDate(dateStr, 'MM-DD')
  },

  // 格式化时间
  formatTime(dateStr) {
    return utils.formatTime(dateStr)
  },

  // 格式化碳减排量
  formatCarbonReduction(value) {
    if (!value || value === 0) return '0g'
    if (value < 1000) return value + 'g'
    return (value / 1000).toFixed(1) + 'kg'
  }
})