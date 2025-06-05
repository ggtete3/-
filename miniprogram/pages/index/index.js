// index.js
const app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const request = require('../../utils/request.js');
const auth = require('../../utils/auth.js');
const config = require('../../utils/config.js');

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    userStats: {},
    activityTypes: [],
    hotProducts: [],
    recentActivities: [],
    userPoints: 0,
    todayPoints: 0,
    banners: [
      {
        image: '/static/images/backgrounds/eco-background.jpg',
        title: '拥抱清洁能源',
        subtitle: '太阳能与风能，驱动绿色未来'
      },
      {
        image: '/static/images/placeholder/eco-forest.jpg',
        title: '植树造林 守护家园',
        subtitle: '每一棵树，都是对地球的承诺'
      },
      {
        image: '/static/images/placeholder/green-transport.jpg',
        title: '绿色出行 低碳生活',
        subtitle: '骑行与步行，城市的健康脉搏'
      }
    ],
    quickActions: [
      {
        type: 'bus',
        title: '公交出行',
        icon: 'icon-bus',
        iconClass: 'green',
        btnText: '去记录',
        btnClass: 'green'
      },
      {
        type: 'cycling',
        title: '骑行',
        icon: 'icon-bike',
        iconClass: 'blue',
        btnText: '敬请期待',
        btnClass: 'blue'
      },
      {
        type: 'electric_car',
        title: '新能源车',
        icon: 'icon-car',
        iconClass: 'indigo',
        btnText: '敬请期待',
        btnClass: 'indigo'
      },
      {
        type: 'electricity',
        title: '居民用电',
        icon: 'icon-flash',
        iconClass: 'amber',
        btnText: '敬请期待',
        btnClass: 'amber'
      }
    ],
    knowledgeArticle: {
      title: '从"新"低碳：全面推进美丽中国建设',
      description: '一图解读2024年六五环境日宣传工作安排',
      image: '/static/images/placeholder/knowledge.jpg'
    },
    featuredProducts: [
      {
        id: 'prod001',
        name: '碳达峰、碳中和100问',
        description: '碳达峰、碳中和100问',
        image: '/static/images/products/eco-bag.jpg',
        points: 10000,
        originalPoints: 12000
      },
      {
        id: 'prod002',
        name: '吨吨鸭笔记本',
        description: '零碳笔记本',
        image: '/static/images/products/bamboo-toothbrush.jpg',
        points: 29999,
        originalPoints: 35000
      },
      {
        id: 'prod003',
        name: '吨吨鸭针织袋',
        description: '零碳针织袋',
        image: '/static/images/products/reusable-bottle.jpg',
        points: 19999,
        originalPoints: 25000
      }
    ]
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onLoad() {
    this.loadUserData()
    this.checkLogin()
  },
  onShow() {
    this.loadUserData()
  },
  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },
  // 加载用户数据
  async loadUserData() {
    try {
      const token = wx.getStorageSync('token');
      if (!token) {
        console.log('用户未登录，无法加载用户数据');
        return;
      }

      // 获取用户积分信息
      const res = await wx.request({
        url: app.globalData.apiBase + '/users/points',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + token
        }
      });

      console.log('loadUserData response:', res);

      if (res.statusCode === 200 && res.data && res.data.code === 200) {
        this.setData({
          userPoints: res.data.data.points || 0,
        });
      } else {
        console.error('获取用户积分失败:', res);
      }
    } catch (error) {
      console.error('加载用户数据异常:', error);
    }
  },
  // 跳转到提交活动页面
  goToSubmit(e) {
    const activity = e.currentTarget.dataset.activity
    wx.navigateTo({
      url: `/pages/activities/submit/submit?activity=${activity}`
    })
  },
  // 跳转到产品详情
  goToProductDetail(e) {
    const product = e.currentTarget.dataset.product
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${product.id}`
    })
  },
  // 跳转到知识页面
  goToKnowledge() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },
  // 跳转到每日答题
  goToDaily() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },
  // 跳转到文章详情
  goToArticle() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },
  // 切换到指定tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },
  // 检查登录状态并加载数据
  async checkLoginAndLoadData() {
    if (!auth.checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    // 加载页面数据
    await this.loadPageData();
  },
  // 加载页面数据
  async loadPageData() {
    try {
      await Promise.all([
        this.loadUserStats(),
        this.loadActivityTypes(),
        this.loadHotProducts(),
        this.loadRecentActivities()
      ]);
    } catch (error) {
      console.error('加载页面数据失败:', error);
    }
  },
  // 加载用户统计信息
  async loadUserStats() {
    try {
      const res = await request.get('/user/stats');
      if (res.code === 200) {
        this.setData({
          userStats: res.data
        });
      }
    } catch (error) {
      console.error('加载用户统计失败:', error);
    }
  },
  // 加载活动类型
  async loadActivityTypes() {
    try {
      const res = await request.get('/activities/types');
      if (res.code === 200) {
        this.setData({
          activityTypes: res.data
        });
      }
    } catch (error) {
      console.error('加载活动类型失败:', error);
      // 使用配置中的默认数据
      const types = Object.keys(config.pointsRules).map(key => ({
        type: key,
        ...config.pointsRules[key]
      }));
      this.setData({
        activityTypes: types
      });
    }
  },
  // 加载热门商品
  async loadHotProducts() {
    try {
      const res = await request.get('/products/hot/list', { limit: 5 });
      if (res.code === 200) {
        this.setData({
          hotProducts: res.data || []
        });
      }
    } catch (error) {
      console.error('加载热门商品失败:', error);
    }
  },
  // 加载最近活动
  async loadRecentActivities() {
    try {
      const res = await request.get('/activities', { limit: 3 });
      if (res.code === 200) {
        this.setData({
          recentActivities: res.data.list || []
        });
      }
    } catch (error) {
      console.error('加载最近活动失败:', error);
    }
  },
  // 页面跳转方法
  goToSubmitActivity() {
    wx.navigateTo({
      url: '/pages/activities/submit/submit'
    });
  },
  goToMall() {
    wx.switchTab({
      url: '/pages/mall/mall'
    });
  },
  goToRecords() {
    wx.navigateTo({
      url: '/pages/me/records/records'
    });
  },
  goToProfile() {
    wx.switchTab({
      url: '/pages/me/me'
    });
  },
  goToActivities() {
    wx.switchTab({
      url: '/pages/activities/activities'
    });
  },
  // 工具方法
  getActivityTypeName(type) {
    const typeMap = {
      'bus': '公交出行',
      'cycling': '骑行',
      'walking': '健康步行',
      'recycling': '垃圾分类',
      'no_disposable_cup': '自带餐具'
    };
    return typeMap[type] || type;
  },
  getStatusText(status) {
    const statusMap = {
      'pending': '审核中',
      'approved': '已通过',
      'rejected': '已拒绝'
    };
    return statusMap[status] || status;
  },
  formatDate(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return `${date.getMonth() + 1}-${date.getDate()}`;
    }
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.loadPageData().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
})

