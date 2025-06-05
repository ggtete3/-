// pages/home/home.js
const auth = require('../../utils/auth.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    activities: [],
    products: [],
    articles: [],
    userPoints: 0,
    todayPoints: 0,
    hotProducts: [],
    isLoggedIn: false,
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
        iconPath: '/static/icons/bus.svg',
        iconBgClass: 'green',
        btnText: '去记录',
        btnClass: 'green'
      },
      {
        type: 'cycling',
        title: '骑行',
        iconPath: '/static/icons/bike.svg',
        iconBgClass: 'blue',
        btnText: '去记录',
        btnClass: 'blue'
      },
      {
        type: 'electric_car',
        title: '新能源车',
        iconPath: '/static/icons/car.svg',
        iconBgClass: 'indigo',
        btnText: '去记录',
        btnClass: 'indigo'
      },
      {
        type: 'electricity',
        title: '居民用电',
        iconPath: '/static/icons/electricity.svg',
        iconBgClass: 'amber',
        btnText: '去记录',
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadData()
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
    console.log('首页显示')
    setTimeout(() => {
      this.checkLoginStatusAndUpdate()
    }, 100)
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
    this.loadData().finally(() => {
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
      title: '孝碳江湖',
      desc: '记录低碳生活，赚取积分兑换好礼！',
      path: '/pages/home/home'
    }
  },

  // 检查登录状态并更新页面
  checkLoginStatusAndUpdate() {
    const isLoggedIn = auth.checkLogin()
    console.log('首页登录状态:', isLoggedIn)
    
    if (this.data.isLoggedIn !== isLoggedIn) {
      this.setData({ isLoggedIn }, () => {
        console.log('首页登录状态已更新:', isLoggedIn)
        if (isLoggedIn) {
          this.getUserInfo()
        } else {
          this.setGuestData()
        }
      })
    } else if (isLoggedIn) {
      this.getUserInfo()
    }
  },

  // 初始化页面
  async loadData() {
    try {
      // 获取轮播图数据
      await this.getBanners()
      
      // 获取热门商品数据
      await this.getHotProducts()
      
      // 获取用户信息
      // const userInfo = await auth.getUserProfile()
      // this.setData({ userInfo })
    
      // 获取活动列表
      // const activities = await auth.getActivities({ page: 1, pageSize: 5 })
      // this.setData({ activities })

      // 获取知识文章
      // const articles = await auth.getKnowledgeArticles({ page: 1, pageSize: 4 })
      // this.setData({ articles })

      // 注意: auth.js 主要处理用户认证和授权，不包含 getActivities, getProducts 等业务API。
      // 这些业务API调用可能需要您在 utils 下创建另一个专门的api.js或者cloud.js来统一管理云函数调用。
      // 暂时注释业务数据加载，以确保登录流程优先修复。
      console.log('loadData: 业务数据加载部分已注释，待确认API来源。')

    } catch (err) {
      console.error('加载首页数据失败:', err)
    }
  },

  // 设置访客数据
  setGuestData() {
    this.setData({
      userPoints: Math.floor(Math.random() * 5000) + 1000,
      todayPoints: Math.floor(Math.random() * 200) + 50
    })
  },

  // 获取用户信息
  async getUserInfo() {
    try {
      // 不再主动调用 getUserProfile，而是先尝试获取已存储的用户信息
      const storedUserInfo = auth.getCurrentUser();
      if (storedUserInfo) {
        this.setData({
          userInfo: storedUserInfo,
          userPoints: storedUserInfo.points || 0,
          todayPoints: storedUserInfo.todayPoints || 0
        });
      } else {
        // 如果没有存储的用户信息，尝试登录获取
        const loginResult = await auth.login();
        if(loginResult.success && loginResult.user){
            this.setData({
                userInfo: loginResult.user,
                userPoints: loginResult.user.points || 0,
                todayPoints: loginResult.user.todayPoints || 0
            });
        } else {
            this.setGuestData();
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.setGuestData()
    }
  },

  // 获取热门商品
  async getHotProducts() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getProducts',
        data: {
          page: 1,
          pageSize: 3,
          featured: true // 获取推荐商品
        }
      });
      
      console.log('获取热门商品返回结果:', result);
      
      // 检查返回格式，适应不同的返回结构
      if (result.result && result.result.code === 0) {
        // 如果有真实数据，使用真实数据
        if (result.result.data && result.result.data.list && result.result.data.list.length > 0) {
          this.setData({
            featuredProducts: result.result.data.list
          });
          console.log('热门商品数据获取成功:', result.result.data.list);
        } else {
          console.log('没有获取到热门商品数据，使用默认数据');
        }
      } else {
        console.error('热门商品数据获取失败:', result);
      }
    } catch (error) {
      console.error('获取热门商品失败:', error);
    }
  },

  // 检查登录状态并跳转
  checkLoginAndNavigate(url, isTab = false) {
    if (auth.requireLoginWithRedirect(url, {toastTitle: '请先登录后访问该功能', delay: 1000, useNavigateTo: !isTab})) {
      if (isTab) {
        wx.switchTab({ url })
      } else {
        wx.navigateTo({ url })
      }
      return true
    }
    return false
  },

  // 跳转到提交活动页面
  goToSubmit(e) {
    const activityType = e.currentTarget.dataset.type || 'bus';
    if (auth.requireLoginWithRedirect(this.route, {toastTitle: '请先登录后记录活动', delay: 1000, useNavigateTo: true})) {
      wx.navigateTo({
        url: `/pages/activities/submit/submit?type=${activityType}`
      });
    }
  },

  // 跳转到商品详情
  goToProductDetail(e) {
    const product = e.currentTarget.dataset.product;
    if (!product || !product._id) {
      console.error('商品ID不存在');
      wx.showToast({
        title: '商品信息不完整',
        icon: 'none'
      });
      return;
    }
    
    if (auth.requireLoginWithRedirect(this.route)) {
      wx.navigateTo({
        url: `/pages/product/detail/detail?id=${product._id}`
      });
    }
  },

  // 跳转到知识页面
  goToKnowledge() {
    wx.navigateTo({ url: '/pages/knowledge/knowledge' });
  },

  // 跳转到每日答题
  goToDaily() {
    if (auth.requireLoginWithRedirect(this.route)) {
        wx.navigateTo({ url: '/pages/activities/daily/daily' });
    }
  },

  // 跳转到文章详情
  goToArticle(e) {
    const articleId = e.currentTarget.dataset.id;
    if (auth.requireLoginWithRedirect(this.route)) {
        wx.navigateTo({ url: `/pages/knowledge/detail/detail?id=${articleId}` });
    }
  },

  // 切换到指定tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },

  // 处理商品兑换
  handleExchange(e) {
    const product = e.currentTarget.dataset.product
    if (!this.data.isLoggedIn) {
      this.checkLoginAndNavigate('/pages/mall/mall', true)
      return
    }
    
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${product.id}`
    })
  },

  // 跳转到登录页面
  goToLogin() {
    auth.smartRequireLogin();
  },

  // 获取轮播图数据
  async getBanners() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getHomePageBanners'
      })

      if (result.result && result.result.success) {
        this.setData({
          banners: result.result.data
        })
        console.log('轮播图数据获取成功:', result.result.data)
      } else {
        console.error('轮播图数据获取失败:', result)
      }
    } catch (err) {
      console.error('调用轮播图云函数失败:', err)
    }
  },

  // 获取活动数据
  async getQuickActions() {
    console.log('getQuickActions: 业务数据加载部分已注释，待确认API来源。')
  },
  
  getIconByCode(iconPath) {
    if (!iconPath) return 'icon-help'; // 默认图标
    const parts = iconPath.split('/').pop().split('.');
    return parts.length > 1 ? `icon-${parts[0]}` : `icon-${parts[0]}`;
  },
  
  // 获取图标样式类
  getIconClass(activityCode) {
    const classes = {
      'bus': 'green',
      'cycling': 'blue',
      'electric_car': 'indigo',
      'electricity': 'amber'
    }
    return classes[activityCode] || 'green'
  },
  
  // 获取按钮样式类
  getButtonClass(activityCode) {
    return this.getIconClass(activityCode) // 使用相同的颜色映射
  },

  // 跳转到活动详情
  goToActivity(e) {
    const activityId = e.currentTarget.dataset.id;
    if (auth.requireLoginWithRedirect(this.route)) {
        wx.navigateTo({
            url: `/pages/activities/detail/detail?id=${activityId}`
        });
    }
  },

  // 跳转到商品详情
  goToProduct(e) {
    const productId = e.currentTarget.dataset.id;
    if (auth.requireLoginWithRedirect(this.route)) {
        wx.navigateTo({
            url: `/pages/product/detail/detail?id=${productId}`
        });
    }
  },

  // 跳转到商城页面
  goToMall() {
    wx.switchTab({
      url: '/pages/mall/mall'
    });
  },
})