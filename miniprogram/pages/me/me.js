// pages/me/me.js
const app = getApp()
const api = require('../../utils/api')
const auth = require('../../utils/auth')
const utils = require('../../utils/util')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    userStats: {
      totalActivities: 0,
      totalRedemptions: 0,
      carbonReduction: 0,
      pendingActivities: 0
    },
    achievements: [
      {
        id: 1,
        name: '环保新手',
        description: '首次记录环保活动',
        icon: '/static/icons/achievements.svg',
        unlocked: false,
        progress: 0,
        target: 1
      },
      {
        id: 2,
        name: '积分达人',
        description: '累计获得1000积分',
        icon: '/static/icons/star.svg',
        unlocked: false,
        progress: 0,
        target: 1000
      },
      {
        id: 3,
        name: '低碳生活家',
        description: '连续7天记录活动',
        icon: '/static/icons/leaf.svg',
        unlocked: false,
        progress: 0,
        target: 7
      }
    ],
    // 计算属性
    carbonReductionText: '0g'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('me page onLoad')
    this.initPage()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('me page onReady')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('me page onShow')
    // 每次页面显示时都重新检查登录状态
    this.checkAndLoadData()
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
    this.refreshData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '孝碳江湖 - 我的低碳生活',
      desc: '记录环保行为，一起守护地球！',
      path: '/pages/me/me'
    }
  },

  // 检查登录状态并加载数据
  checkAndLoadData() {
    console.log('检查登录状态')
    
    // 使用新的统一登录检查方法
    if (!auth.requireLoginWithRedirect('/pages/me/me', {
      toastTitle: '请先登录后访问个人中心',
      delay: 1000,
      useNavigateTo: false  // 使用redirectTo而不是navigateTo
    })) {
      return
    }
    
    // 已登录则加载用户数据
    console.log('用户已登录，加载数据')
    this.loadUserData()
  },

  // 加载用户数据
  async loadUserData() {
    try {
      await Promise.all([
        this.getUserInfo(),
        this.getUserStats(),
        this.loadAchievements()
      ])
    } catch (error) {
      console.error('加载用户数据失败:', error)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    }
  },

  // 初始化页面
  async initPage() {
    console.log('初始化页面')
    this.checkAndLoadData()
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      console.log('获取用户信息...')
      
      // 优先使用认证模块中的用户信息
      const authUserInfo = auth.getCurrentUser()
      if (authUserInfo) {
        console.log('使用认证用户信息:', authUserInfo)
        this.setData({ 
          userInfo: {
            ...authUserInfo,
            available_points: authUserInfo.available_points || authUserInfo.points || 0,
            total_points: authUserInfo.total_points || authUserInfo.points || 0
          }
        })
        return
      }
      
      // 其次使用全局用户信息
      const globalUserInfo = getApp().globalData.userInfo
      if (globalUserInfo) {
        console.log('使用全局用户信息:', globalUserInfo)
        this.setData({ 
          userInfo: {
            ...globalUserInfo,
            available_points: globalUserInfo.available_points || globalUserInfo.points || 0,
            total_points: globalUserInfo.total_points || globalUserInfo.points || 0
          }
        })
        return
      }
      
      // 如果没有用户信息，重新检查登录状态
      console.log('无用户信息，重新检查登录状态')
      this.checkAndLoadData()
      
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.checkAndLoadData()
    }
  },

  // 获取用户统计数据
  async getUserStats() {
    try {
      console.log('获取用户统计...')
      
      // 模拟从API获取统计数据
      const mockStats = {
        totalActivities: 25,
        totalRedemptions: 3,
        carbonReduction: 1600, // 单位：克
        pendingActivities: 2
      }
      
      this.setData({
        userStats: mockStats,
        carbonReductionText: this.formatCarbonReduction(mockStats.carbonReduction)
      })
      
    } catch (error) {
      console.error('获取用户统计失败:', error)
    }
  },

  // 加载成就数据
  async loadAchievements() {
    try {
      console.log('加载成就数据...')
      
      // 基于用户数据更新成就进度
      const achievements = this.data.achievements.map(achievement => {
        let progress = 0
        let unlocked = false
        
        switch (achievement.id) {
          case 1: // 环保新手
            progress = this.data.userStats.totalActivities > 0 ? 1 : 0
            unlocked = progress >= achievement.target
            break
          case 2: // 积分达人
            progress = this.data.userInfo.total_points || 0
            unlocked = progress >= achievement.target
            break
          case 3: // 低碳生活家
            progress = Math.min(this.data.userStats.totalActivities, achievement.target)
            unlocked = progress >= achievement.target
            break
        }
        
        return {
          ...achievement,
          progress,
          unlocked
        }
      })
      
      this.setData({ achievements })
      
    } catch (error) {
      console.error('加载成就数据失败:', error)
    }
  },

  // 格式化加入日期
  formatJoinDate(dateStr) {
    if (!dateStr) return '今天'
    return utils.formatTime(new Date(dateStr), 'YYYY年MM月')
  },

  // 格式化碳减排量
  formatCarbonReduction(value) {
    if (!value || value < 1000) {
      return `${value || 0}g`
    }
    return `${(value / 1000).toFixed(1)}kg`
  },

  // 快捷提交活动
  goToSubmitActivity(e) {
    const type = e.currentTarget.dataset.type
    const typeMap = {
      'bus': '公交出行',
      'bike': '骑行出行', 
      'walking': '步行出行',
      'recycle': '垃圾分类'
    }
    
    wx.navigateTo({
      url: `/pages/activities/submit/submit?type=${type}&title=${typeMap[type] || ''}`
    })
  },

  // 跳转到活动记录
  goToActivityRecords() {
    wx.navigateTo({
      url: '/pages/me/records/records'
    })
  },

  // 跳转到兑换记录
  goToRedemptionRecords() {
    wx.navigateTo({
      url: '/pages/me/redemption/redemption'
    })
  },

  // 显示积分规则
  showRules() {
    wx.showModal({
      title: '积分规则',
      content: '1. 公交出行：10积分/次\n2. 骑行出行：15积分/次\n3. 步行出行：5积分/次\n4. 节约用电：根据节约度数计算\n5. 垃圾分类：5积分/次\n\n积分可用于兑换环保商品，让低碳生活更有意义！',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '如有问题，请联系我们：\n\n📞 客服热线：400-888-0000\n📧 邮箱：service@xiaotanjh.com\n🕐 服务时间：9:00-18:00',
      showCancel: true,
      cancelText: '取消',
      confirmText: '拨打电话',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '4008880000',
            fail: () => {
              wx.showToast({
                title: '拨打失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 显示所有成就
  showAllAchievements() {
    let content = '🏆 成就列表：\n\n'
    this.data.achievements.forEach((achievement, index) => {
      const status = achievement.unlocked ? '✅ 已解锁' : `⏳ ${achievement.progress}/${achievement.target}`
      content += `${index + 1}. ${achievement.name}\n   ${achievement.description}\n   ${status}\n\n`
    })
    
    wx.showModal({
      title: '我的成就',
      content: content,
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 显示成就详情
  showAchievementDetail(e) {
    const achievement = e.currentTarget.dataset.achievement
    const status = achievement.unlocked ? '已解锁' : `进度：${achievement.progress}/${achievement.target}`
    
    wx.showModal({
      title: achievement.name,
      content: `${achievement.description}\n\n${status}`,
      showCancel: false,
      confirmText: '确定'
    })
  },

  // 刷新数据
  async refreshData() {
    console.log('刷新页面数据')
    try {
      await this.loadUserData()
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
  }
})