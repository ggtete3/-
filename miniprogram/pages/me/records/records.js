// pages/me/records/records.js
const auth = require('../../../utils/auth.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'activity', // 'activity' 或 'redemption'
    activities: [],
    redemptions: [],
    activityPage: 1,
    redemptionPage: 1,
    activityPageSize: 10,
    redemptionPageSize: 10,
    activityHasMore: true,
    redemptionHasMore: true,
    isLoading: false,
    isLoggedIn: false,
    statusMap: {
      'pending': '审核中',
      'approved': '已通过',
      'rejected': '已拒绝'
    },
    activityTypeMap: {
      'bus': '公交出行',
      'cycling': '骑行',
      'walking': '步行',
      'recycling': '垃圾分类',
      'no_disposable_cup': '自带杯子'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 如果有传入tab参数，则切换到对应tab
    if (options.tab && (options.tab === 'activity' || options.tab === 'redemption')) {
      this.setData({ activeTab: options.tab })
    }
    
    this.checkLoginStatus()
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
    this.checkLoginStatus()
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
    this.loadData(true).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.activeTab === 'activity' && this.data.activityHasMore) {
      this.loadActivities(false)
    } else if (this.data.activeTab === 'redemption' && this.data.redemptionHasMore) {
      this.loadRedemptions(false)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  checkLoginStatus() {
    const isLoggedIn = auth.checkLogin()
    this.setData({ isLoggedIn })
    
    if (isLoggedIn) {
      this.loadData()
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }, 2000)
        }
      })
    }
  },

  // 加载数据
  async loadData(refresh = true) {
    if (this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    try {
      if (this.data.activeTab === 'activity') {
        await this.loadActivities(refresh)
      } else {
        await this.loadRedemptions(refresh)
      }
    } catch (err) {
      console.error('加载数据失败:', err)
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 加载活动记录
  async loadActivities(refresh = true) {
    const page = refresh ? 1 : this.data.activityPage
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getActivities',
        data: {
          page,
          pageSize: this.data.activityPageSize
        }
      })
      
      if (result.result && result.result.success) {
        const activities = result.result.data.activities
        const total = result.result.data.total
        
        this.setData({
          activities: refresh ? activities : [...this.data.activities, ...activities],
          activityLoading: false,
          activityPage: refresh ? 2 : this.data.activityPage + 1,
          activityHasMore: (page * this.data.activityPageSize) < total
        })
      } else {
        throw new Error((result && result.result && result.result.error) || '获取活动记录失败')
      }
    } catch (err) {
      console.error('获取活动记录失败:', err)
      throw err
    }
  },

  // 加载兑换记录
  async loadRedemptions(refresh = true) {
    const page = refresh ? 1 : this.data.redemptionPage
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'getRedemptions',
        data: {
          page,
          pageSize: this.data.redemptionPageSize
        }
      })
      
      if (result.result && result.result.success) {
        const redemptions = result.result.data.redemptions
        const total = result.result.data.total
        
        this.setData({
          redemptions: refresh ? redemptions : [...this.data.redemptions, ...redemptions],
          redemptionLoading: false,
          redemptionPage: refresh ? 2 : this.data.redemptionPage + 1,
          redemptionHasMore: (page * this.data.redemptionPageSize) < total
        })
      } else {
        throw new Error((result && result.result && result.result.error) || '获取兑换记录失败')
      }
    } catch (err) {
      console.error('获取兑换记录失败:', err)
      throw err
    }
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab !== this.data.activeTab) {
      this.setData({ activeTab: tab }, () => {
        // 如果该标签页的数据还没加载过，则加载数据
        if ((tab === 'activity' && this.data.activities.length === 0) || 
            (tab === 'redemption' && this.data.redemptions.length === 0)) {
          this.loadData()
        }
      })
    }
  },

  // 查看活动详情
  viewActivityDetail(e) {
    const activityId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activities/detail/detail?id=${activityId}`
    })
  },

  // 查看兑换详情
  viewRedemptionDetail(e) {
    const redemptionId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/me/redemption/detail?id=${redemptionId}`
    })
  },

  // 格式化时间
  formatDate(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  },

  // 获取状态样式类
  getStatusClass(status) {
    switch (status) {
      case 'approved':
        return 'status-approved'
      case 'rejected':
        return 'status-rejected'
      default:
        return 'status-pending'
    }
  },

  // 登录
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})