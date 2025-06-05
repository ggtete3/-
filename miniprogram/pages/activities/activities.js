// pages/activities/activities.js
const app = getApp()
const { getCloudImage } = require('../../utils/cloud-images')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalReduction: 2050,
    todayReduction: 150,
    useCloudImage: true, // 控制是否使用云存储图片
    cloudBackgroundImage: 'https://cloudbase-7gz7y7qd7af829dc-1359798327.tcloudbaseapp.com/static-images/backgrounds/eco-background.jpg',
    activities: [
      {
        type: 'bus',
        title: '公交出行',
        unit: '乘坐一次公交',
        points: 150,
        description: '选乘公交，绿色出行',
        iconPath: '../../static/icons/magic/bus.svg',
        iconBg: 'green',
        btnClass: 'green',
        available: true
      },
      {
        type: 'cycling',
        title: '骑行',
        unit: '骑行1公里',
        points: 40,
        description: '双脚踏出蓝天',
        iconPath: '../../static/icons/magic/bike.svg',
        iconBg: 'blue',
        btnClass: 'blue',
        available: true
      },
      {
        type: 'electric_car',
        title: '新能源车出行',
        unit: '坐1公里新能源车',
        points: 70,
        description: '新能源、新时尚、新选择',
        iconPath: '../../static/icons/magic/car.svg',
        iconBg: 'indigo',
        btnClass: 'indigo',
        available: true
      },
      {
        type: 'electricity',
        title: '居民用电',
        unit: '日节电1度',
        points: 525,
        description: '随手节约1度电，点亮绿色发展光',
        iconPath: '../../static/icons/magic/electricity.svg',
        iconBg: 'amber',
        btnClass: 'amber',
        available: true
      },
      {
        type: 'walking',
        title: '步行出行',
        unit: '步行1公里',
        points: 30,
        description: '健康步行，低碳环保',
        iconPath: '../../static/icons/magic/walking.svg',
        iconBg: 'emerald',
        btnClass: 'emerald',
        available: true
      },
      {
        type: 'recycle',
        title: '垃圾分类',
        unit: '次分类回收',
        points: 50,
        description: '正确分类，保护环境',
        iconPath: '../../static/icons/magic/recycle.svg',
        iconBg: 'purple',
        btnClass: 'purple',
        available: true
      },
      {
        type: 'other',
        title: '更多低碳行动',
        unit: '次环保行为',
        points: 50,
        description: '如自带水杯、节约用水等',
        iconPath: '../../static/icons/magic/leaf-action.svg',
        iconBg: 'rose',
        btnClass: 'rose',
        available: true
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserStats()
    this.getTopBanner()
    this.getActivityTypes()
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
    this.loadUserStats()
    this.getTopBanner()
    this.getActivityTypes()
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
    Promise.all([
      this.loadUserStats(),
      this.getTopBanner(),
      this.getActivityTypes()
    ]).finally(() => {
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
      title: '低碳生活，从点滴做起',
      path: '/pages/activities/activities'
    }
  },

  // 加载用户统计数据
  async loadUserStats() {
    try {
      // 确保云环境已初始化
      if (app.ensureCloudInitApp) {
        app.ensureCloudInitApp();
      } else if (wx.cloud) {
        wx.cloud.init({
          env: app.globalData.cloudEnvId,
          traceUser: true
        });
      }

      const { result } = await wx.cloud.callFunction({
        name: 'getUserStats'
      });

      if (result && result.success) {
        this.setData({
          totalReduction: result.data.totalReduction || 0,
          todayReduction: result.data.todayReduction || 0
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 使用默认数据，不更新UI
    }
  },

  // 获取顶部轮播图数据 - 由于原页面没有轮播图，此函数可以保留但不影响UI
  async getTopBanner() {
    try {
      // 确保云环境已初始化
      if (app.ensureCloudInitApp) {
        app.ensureCloudInitApp();
      }

      // 调用云函数但不更新UI，因为原页面没有使用这些数据
      await wx.cloud.callFunction({
        name: 'getHomePageBanners',
        data: { type: 'activity' }
      });
    } catch (error) {
      console.error('获取顶部轮播图数据失败:', error);
    }
  },

  // 获取活动类型列表
  async getActivityTypes() {
    try {
      // 确保云环境已初始化
      if (app.ensureCloudInitApp) {
        app.ensureCloudInitApp();
      }

      const { result } = await wx.cloud.callFunction({
        name: 'getActivityTypes'
      });

      // 如果成功获取到活动类型数据，则更新UI
      // 但如果失败，保留默认数据，不影响UI
      if (result && result.success && result.data && result.data.types) {
        const activeTypes = result.data.types.filter(item => item.status === 'active');
        if (activeTypes && activeTypes.length > 0) {
          this.setData({
            activities: activeTypes
          });
        }
      }
    } catch (error) {
      console.error('获取活动类型列表失败:', error);
      // 使用默认数据，不更新UI
    }
  },

  // 跳转到提交页面
  goToSubmit(e) {
    const activity = e.currentTarget.dataset.activity
    const activityData = this.data.activities.find(item => item.type === activity)
    
    if (!activityData) {
      wx.showToast({
        title: '活动类型不存在',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/activities/submit/submit?activity=${activity}`
    })
  }
})