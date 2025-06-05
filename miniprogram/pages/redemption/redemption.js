// pages/redemption/redemption.js
const auth = require('../../utils/auth')
const util = require('../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 筛选状态
    statusFilters: [
      { value: 'all', name: '全部', icon: '📋' },
      { value: 'pending', name: '待核销', icon: '⏳' },
      { value: 'completed', name: '已核销', icon: '✅' },
      { value: 'expired', name: '已过期', icon: '❌' }
    ],
    selectedStatus: 'all',
    
    // 记录数据
    records: [],
    loading: false,
    page: 1,
    hasMore: true,
    
    // 详情弹窗
    showDetailModal: false,
    selectedRecord: {}
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
          url: '/pages/login/login?redirect=' + encodeURIComponent('/pages/redemption/redemption')
        })
      }, 1500)
      return
    }
    
    this.loadExchangeRecords()
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
      wx.switchTab({
        url: '/pages/index/index'
      })
      return
    }
    
    // 刷新数据
    this.refreshRecords()
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
    this.refreshRecords().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreRecords()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '孝碳江湖兑换记录',
      desc: '查看我的积分兑换记录',
      path: '/pages/redemption/redemption'
    }
  },

  // 加载兑换记录
  async loadExchangeRecords(loadMore = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      // 从本地存储获取兑换记录
      const allRecords = wx.getStorageSync('exchangeRecords') || []
      
      // 处理记录数据
      const processedRecords = allRecords.map(record => {
        const createdAt = new Date(record.created_at)
        const expireAt = new Date(record.expire_at)
        const now = new Date()
        
        // 判断是否过期
        const isExpired = now > expireAt
        let status = record.status
        if (status === 'pending' && isExpired) {
          status = 'expired'
        }
        
        // 状态文本
        const statusTexts = {
          pending: '待核销',
          completed: '已核销',
          expired: '已过期'
        }
        
        // 过期状态信息
        let expireStatus = ''
        if (status === 'pending') {
          const diffTime = expireAt.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          if (diffDays > 0) {
            expireStatus = `${diffDays}天后过期`
          } else {
            expireStatus = '即将过期'
          }
        }
        
        return {
          ...record,
          status,
          status_text: statusTexts[status],
          expire_status: expireStatus,
          created_at_formatted: util.formatDate(createdAt, 'MM-dd HH:mm'),
          expire_at_formatted: util.formatDate(expireAt, 'MM-dd HH:mm')
        }
      })
      
      // 根据状态筛选
      let filteredRecords = processedRecords
      if (this.data.selectedStatus !== 'all') {
        filteredRecords = processedRecords.filter(record => 
          record.status === this.data.selectedStatus
        )
      }
      
      // 排序：最新的在前
      filteredRecords.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      
      const currentRecords = loadMore ? this.data.records : []
      this.setData({
        records: [...currentRecords, ...filteredRecords],
        hasMore: false, // 本地数据无需分页
        page: loadMore ? this.data.page + 1 : 2
      })
    } catch (error) {
      console.error('加载兑换记录失败:', error)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 刷新记录
  async refreshRecords() {
    this.setData({
      records: [],
      page: 1,
      hasMore: true
    })
    await this.loadExchangeRecords()
  },

  // 加载更多记录
  loadMoreRecords() {
    this.loadExchangeRecords(true)
  },

  // 改变状态筛选
  changeStatusFilter(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ selectedStatus: status })
    this.refreshRecords()
  },

  // 显示记录详情
  showRecordDetail(e) {
    const record = e.currentTarget.dataset.record
    this.setData({
      selectedRecord: record,
      showDetailModal: true
    })
  },

  // 关闭详情弹窗
  closeDetailModal() {
    this.setData({ 
      showDetailModal: false,
      selectedRecord: {}
    })
  },

  // 显示核销码详情
  showVerificationCode(e) {
    e.stopPropagation()
    const record = e.currentTarget.dataset.record
    this.setData({
      selectedRecord: record,
      showDetailModal: true
    })
  },

  // 复制核销码（迷你版）
  copyCode(e) {
    e.stopPropagation()
    const code = e.currentTarget.dataset.code
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '核销码已复制',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
  },

  // 复制核销码（详情弹窗）
  copyVerificationCode() {
    wx.setClipboardData({
      data: this.data.selectedRecord.verification_code,
      success: () => {
        wx.showToast({
          title: '核销码已复制',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
  },

  // 查看门店
  viewStores() {
    wx.showModal({
      title: '合作门店',
      content: '查看门店功能开发中，可关注公众号获取最新门店信息。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 跳转到商城
  goToMall() {
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  }
})