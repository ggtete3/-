// pages/mall/mall.js
const api = require('../../utils/api')
const auth = require('../../utils/auth')
const app = getApp()
const { getCloudImage } = require('../../utils/cloud-images')
const cloudStorage = require('../../utils/cloudStorage')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userPoints: 0,
    searchKeyword: '',
    sortType: 'default',
    defaultProductImage: 'https://cloudbase-7gz7y7qd7af829dc-1359798327.tcloudbaseapp.com/static-images/placeholder/product-placeholder.jpg',
    
    // 轮播图数据
    banners: [
      {
        id: 1,
        image_url: 'https://cloudbase-7gz7y7qd7af829dc-1359798327.tcloudbaseapp.com/static-images/backgrounds/eco-background.jpg',
        title: '环保好礼 积分兑换',
        subtitle: '记录低碳生活，享受绿色好礼'
      },
      {
        id: 2,
        image_url: 'https://cloudbase-7gz7y7qd7af829dc-1359798327.tcloudbaseapp.com/static-images/backgrounds/eco-background.jpg',
        title: '新品上线 限时优惠',
        subtitle: '精选环保商品，积分超值兑换'
      },
      {
        id: 3,
        image_url: 'https://cloudbase-7gz7y7qd7af829dc-1359798327.tcloudbaseapp.com/static-images/backgrounds/eco-background.jpg',
        title: '低碳生活 从我做起',
        subtitle: '每一份努力都值得奖励'
      }
    ],
    
    // 商品分类
    categories: [
      { id: 'all', name: '全部', icon: '🏪' },
      { id: 'daily', name: '日用品', icon: '🧴' },
      { id: 'electronics', name: '数码', icon: '📱' },
      { id: 'clothing', name: '服装', icon: '👕' },
      { id: 'food', name: '食品', icon: '🍯' },
      { id: 'eco', name: '环保用品', icon: '🌱' },
      { id: 'books', name: '图书', icon: '📚' }
    ],
    selectedCategory: 'all',
    
    // 商品数据
    featuredProducts: [],
    products: [],
    loading: false,
    page: 1,
    hasMore: true,
    
    // 兑换弹窗
    showExchangeModal: false,
    selectedProduct: {},
    exchanging: false,
    
    // 兑换成功弹窗
    showSuccessModal: false,
    verificationCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('商城页面加载')
    
    // 使用新的统一登录检查方法
    if (!auth.requireLoginWithRedirect('/pages/mall/mall', {
      toastTitle: '请先登录后访问积分商城',
      delay: 1500
    })) {
      return
    }
    
    this.initPage()
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
    console.log('商城页面显示')
    
    // 确保用户已登录
    this.ensureLogin().then(isLoggedIn => {
      if (isLoggedIn) {
        // 每次显示时更新用户积分
        this.getUserPoints();
      }
    });
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
    this.refreshProducts().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreProducts()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '孝碳江湖积分商城 - 环保好礼等你兑换',
      desc: '记录低碳生活，用积分兑换心仪商品！',
      path: '/pages/mall/mall'
    }
  },

  // 初始化页面
  async initPage() {
    await Promise.all([
      this.getUserPoints(),
      this.loadFeaturedProducts(),
      this.loadProducts()
    ])
  },

  // 确保用户已登录
  async ensureLogin() {
    try {
      const isLoggedIn = await auth.checkLogin();
      if (!isLoggedIn) {
        console.log('用户未登录，跳转到登录页');
        wx.navigateTo({
          url: '/pages/login/login'
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      // 出错时也跳转到登录页，重新登录
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return false;
    }
  },

  // 获取用户积分
  async getUserPoints(retryCount = 0) {
    try {
      console.log('开始获取用户积分，重试次数:', retryCount);
      
      // 检查登录状态
      const isLoggedIn = await auth.checkLogin();
      if (!isLoggedIn) {
        console.log('用户未登录，跳转登录页');
        wx.navigateTo({
          url: '/pages/login/login'
        });
        return;
      }

      // 确保获取到有效的openid
      if (!wx.getStorageSync('openid')) {
        console.log('本地未缓存openid，重新登录');
        await auth.login();
      }

      const { result } = await wx.cloud.callFunction({
        name: 'getUserStats',
        data: {}
      });
      
      console.log('获取用户积分结果:', result);
      
      if (result && result.success && result.data) {
        this.setData({ userPoints: result.data.points || 0 });
        app.globalData.userInfo = app.globalData.userInfo || {};
        app.globalData.userInfo.points = result.data.points || 0;
      } else {
        console.error('获取用户积分失败:', result ? result.error : '返回数据格式错误');
        
        // 如果是未登录错误，重新登录
        if (result && result.error && result.error.includes('not logged in')) {
          console.log('用户未登录，重新登录');
          await auth.login();
          if (retryCount < 3) {
            return this.getUserPoints(retryCount + 1);
          }
        }
        
        // 如果重试次数小于3次，则重试
        if (retryCount < 3) {
          console.log('准备重试获取积分，当前重试次数:', retryCount);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
          return this.getUserPoints(retryCount + 1);
        }
        
        // 重试3次后仍失败，设置默认值
        this.setData({ userPoints: 0 });
        if (app.globalData.userInfo) {
          app.globalData.userInfo.points = 0;
        }
        
        // 显示错误提示
        wx.showToast({
          title: '获取积分失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('获取用户积分失败:', error);
      
      // 如果重试次数小于3次，则重试
      if (retryCount < 3) {
        console.log('准备重试获取积分，当前重试次数:', retryCount);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
        return this.getUserPoints(retryCount + 1);
      }
      
      // 重试3次后仍失败，设置默认值
      this.setData({ userPoints: 0 });
      if (app.globalData.userInfo) {
        app.globalData.userInfo.points = 0;
      }
      
      // 显示错误提示
      wx.showToast({
        title: '获取积分失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 加载推荐商品
  async loadFeaturedProducts() {
    try {
      this.setData({ loading: true });

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
        name: 'getProducts',
        data: {
          isFeatured: true,
          limit: 6
        }
      });

      if (result && result.success && result.data) {
        // 处理商品图片，优先使用云存储图片
        const processedProducts = result.data.map(product => {
          // 处理产品图片链接，优先使用云存储
          if (product.image_url && product.image_url.includes('eco-friendly')) {
            product.cloudImageUrl = getCloudImage(product.image_url);
          }
          return product;
        });

        this.setData({
          featuredProducts: processedProducts
        });
      } else {
        this.setData({
          featuredProducts: []
        });
        console.error('获取推荐商品失败:', result ? result.error : '返回数据格式错误');
      }
    } catch (error) {
      console.error('获取推荐商品出错:', error);
      this.setData({
        featuredProducts: []
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载商品列表
  async loadProducts(loadMore = false) {
    try {
      if (this.data.loading) return;
      
      this.setData({ loading: true });
      
      const page = loadMore ? this.data.page + 1 : 1;
      const pageSize = 10;
      
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
        name: 'getProducts',
        data: {
          page,
          pageSize,
          category: this.data.selectedCategory !== 'all' ? this.data.selectedCategory : '',
          keyword: this.data.searchKeyword,
          sortType: this.data.sortType
        }
      });
      
      if (result && result.success && result.data) {
        // 处理商品图片，优先使用云存储图片
        const processedProducts = result.data.map(product => {
          // 处理产品图片链接，优先使用云存储
          if (product.image_url && product.image_url.includes('eco-friendly')) {
            product.cloudImageUrl = getCloudImage(product.image_url);
          }
          return product;
        });
        
        // 根据排序处理数据
        const sortedProducts = this.sortProducts(processedProducts);
        
        this.setData({
          products: loadMore ? [...this.data.products, ...sortedProducts] : sortedProducts,
          page,
          hasMore: result.data.length === pageSize
        });
      } else {
        this.setData({
          products: loadMore ? this.data.products : [],
          hasMore: false
        });
        if (!loadMore) {
          console.error('获取商品列表失败:', result ? result.error : '返回数据格式错误');
        }
      }
    } catch (error) {
      console.error('获取商品列表出错:', error);
      this.setData({
        products: loadMore ? this.data.products : [],
        hasMore: false
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  
  // 商品排序
  sortProducts(products) {
    switch (this.data.sortType) {
      case 'price_asc':
        products.sort((a, b) => a.points_required - b.points_required)
        break
      case 'price_desc':
        products.sort((a, b) => b.points_required - a.points_required)
        break
      case 'popular':
        products.sort((a, b) => b.exchange_count - a.exchange_count)
        break
      default:
        // 默认排序：热门商品在前
        products.sort((a, b) => {
          if (a.is_hot && !b.is_hot) return -1
          if (!a.is_hot && b.is_hot) return 1
          return b.exchange_count - a.exchange_count
        })
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  // 搜索确认
  onSearch() {
    this.refreshProducts()
  },

  // 选择商品分类
  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({ selectedCategory: categoryId })
    this.refreshProducts()
  },

  // 改变排序方式
  changeSortType(e) {
    const sortType = e.currentTarget.dataset.type
    this.setData({ sortType })
    this.refreshProducts()
  },

  // 刷新商品列表
  async refreshProducts() {
    this.setData({
      products: [],
      page: 1,
      hasMore: true
    })
    await this.loadProducts()
  },

  // 加载更多商品
  loadMoreProducts() {
    this.loadProducts(true)
  },

  // 查看全部推荐商品
  showAllFeatured() {
    this.setData({ selectedCategory: 'all' })
    this.refreshProducts()
  },

  // 快速兑换
  quickExchange(e) {
    e.stopPropagation()
    
    const productId = e.currentTarget.dataset.id
    // 使用_id字段查找商品
    const product = this.data.products.find(p => p._id === productId) || 
                   this.data.featuredProducts.find(p => p._id === productId)
    
    if (!product) {
      wx.showToast({
        title: '商品信息错误',
        icon: 'none'
      })
      return
    }

    this.setData({
      selectedProduct: product,
      showExchangeModal: true
    })
  },

  // 关闭兑换弹窗
  closeExchangeModal() {
    this.setData({
      showExchangeModal: false,
      selectedProduct: {},
      exchanging: false
    })
  },

  // 确认兑换
  async confirmExchange() {
    if (this.data.exchanging) return
    
    const product = this.data.selectedProduct
    if (this.data.userPoints < product.points_required) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      })
      return
    }
    
    this.setData({ exchanging: true })
    try {
      const res = await api.exchangeProduct(product._id)
      if (res.data.success) {
        const verificationCode = this.generateVerificationCode()
        this.setData({
          verificationCode: verificationCode,
          showExchangeModal: false,
          showSuccessModal: true,
          exchanging: false
        })
        // 更新用户积分
        await this.getUserPoints()
        // 保存兑换记录
        this.saveExchangeRecord(product, verificationCode)
      } else {
        wx.showToast({
          title: res.data.message || '兑换失败',
          icon: 'none'
        })
        this.setData({ exchanging: false })
      }
    } catch (error) {
      console.error('兑换商品失败:', error)
      wx.showToast({
        title: '兑换失败，请重试',
        icon: 'none'
      })
      this.setData({ exchanging: false })
    }
  },

  // 生成核销码
  generateVerificationCode() {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `HC${timestamp.slice(-6)}${random}`
  },

  // 保存兑换记录
  saveExchangeRecord(product, verificationCode) {
    try {
      const records = wx.getStorageSync('exchangeRecords') || []
      const newRecord = {
        id: Date.now(),
        product_id: product._id,
        product_name: product.name,
        product_image: product.image_url,
        points_cost: product.points_required,
        verification_code: verificationCode,
        status: 'pending', // pending: 待核销, completed: 已核销
        created_at: new Date().toISOString(),
        expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后过期
      }
      
      records.unshift(newRecord)
      wx.setStorageSync('exchangeRecords', records)
    } catch (error) {
      console.error('保存兑换记录失败:', error)
    }
  },

  // 关闭兑换成功弹窗
  closeSuccessModal() {
    this.setData({ showSuccessModal: false })
  },

  // 复制核销码
  copyVerificationCode() {
    wx.setClipboardData({
      data: this.data.verificationCode,
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

  // 跳转到兑换记录
  goToRedemptionRecords() {
    this.closeSuccessModal()
    wx.navigateTo({
      url: '/pages/redemption/redemption'
    })
  },

  // 跳转到商品详情
  goToProductDetail(e) {
    const productId = e.currentTarget.dataset.id
    console.log('跳转到商品详情，商品ID:', productId)
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${productId}`
    })
  },

  // 跳转到活动页面
  goToActivities() {
    wx.switchTab({
      url: '/pages/activities/activities'
    })
  }
})