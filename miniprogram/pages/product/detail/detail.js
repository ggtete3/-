// pages/product/detail/detail.js
const app = getApp()
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')
const { getCloudImage } = require('../../../utils/cloud-images')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    productId: '',
    product: null,
    userPoints: 0,
    reviews: [],
    showExchangeModal: false,
    exchanging: false,
    loading: true,
    canExchange: false,
    exchangeRules: [
      {
        title: '兑换条件',
        content: '确保您的碳积分余额充足，且当前商品库存充足'
      },
      {
        title: '兑换流程',
        content: '点击"立即兑换"按钮，确认兑换信息后完成兑换'
      },
      {
        title: '使用说明',
        content: '兑换成功后，请在"我的-兑换记录"中查看兑换详情和使用方式'
      }
    ],
    isAdmin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        productId: options.id
      })
      this.loadProductDetail(options.id)
    } else {
      wx.showToast({
        title: '商品ID不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
    
    // 获取用户积分
    this.loadUserPoints()
    
    // 检查是否为管理员
    this.checkAdminStatus()
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
    this.loadUserPoints()
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
      title: `孝碳江湖 - ${this.data.product.name}`,
      desc: `仅需${this.data.product.points_required}积分即可兑换！`,
      path: `/pages/product/detail/detail?id=${this.data.productId}`,
      imageUrl: this.data.product.image_url
    }
  },

  // 加载商品详情
  async loadProductDetail(productId) {
    try {
      this.setData({ loading: true })
      
      // 确保云环境已初始化
      if (app.ensureCloudInitApp) {
        app.ensureCloudInitApp()
      }
      
      const { result } = await wx.cloud.callFunction({
        name: 'getProducts',
        data: {
          productId
        }
      })
      
      if (result && result.success && result.data) {
        // 处理产品图片，使用云存储图片
        const product = result.data
        
        // 处理详情图片
        if (product.image_url && product.image_url.includes('eco-friendly')) {
          product.cloudImageUrl = getCloudImage(product.image_url)
        }
        
        // 如果有多张图片，处理每张图片
        if (product.images && product.images.length > 0) {
          product.images = product.images.map(img => {
            if (img.includes('eco-friendly')) {
              return getCloudImage(img)
            }
            return img
          })
        }
        
        this.setData({
          product,
          loading: false,
          canExchange: this.data.userPoints >= (product.points_required || product.points || 0)
        })
      } else {
        wx.showToast({
          title: '获取商品详情失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    } catch (error) {
      console.error('获取商品详情失败:', error)
      wx.showToast({
        title: '获取商品详情失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 加载商品评价
  async loadProductReviews() {
    try {
      // 模拟评价数据
      const mockReviews = [
        {
          id: 1,
          user_name: '环保达人',
          user_avatar: '/static/images/default-avatar.png',
          rating: 5,
          content: '质量很好，很实用，支持环保事业！',
          created_at: '2024-01-15'
        },
        {
          id: 2,
          user_name: '绿色生活',
          user_avatar: '/static/images/default-avatar.png',
          rating: 4,
          content: '袋子很结实，设计也很好看，推荐购买。',
          created_at: '2024-01-10'
        },
        {
          id: 3,
          user_name: '低碳先锋',
          user_avatar: '/static/images/default-avatar.png',
          rating: 5,
          content: '用积分兑换很划算，为地球环保贡献一份力量！',
          created_at: '2024-01-08'
        }
      ]
      
      this.setData({ reviews: mockReviews })
    } catch (error) {
      console.error('加载商品评价失败:', error)
    }
  },

  // 加载用户积分
  async loadUserPoints() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getUserProfile',
        data: { action: 'getPoints' }
      })

      if (result && result.success && result.data) {
        const points = result.data.points || 0;
        const product = this.data.product || {};
        const productPoints = product.points || product.points_required || 0;
        
        this.setData({ 
          userPoints: points,
          canExchange: points >= productPoints && (product.stock > 0)
        })
      } else {
        console.warn('获取用户积分返回值异常:', result)
        // 设置默认值，避免界面出错
        this.setData({ userPoints: 0 })
      }
    } catch (error) {
      console.error('获取用户积分失败:', error)
      // 设置默认值，避免界面出错
      this.setData({ userPoints: 0 })
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = this.data.product.images || [this.data.product.image_url]
    
    wx.previewImage({
      current: url,
      urls: urls
    })
  },

  // 兑换商品
  async exchangeProduct() {
    if (!this.data.canExchange) {
      wx.showToast({
        title: '积分不足或库存不足',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.product || !this.data.product._id) {
      wx.showToast({
        title: '商品信息错误',
        icon: 'none'
      });
      return;
    }
    
    // 获取积分值，确保使用正确的字段
    const pointsRequired = this.data.product.points || this.data.product.points_required || 0;
    
    const confirmResult = await wx.showModal({
      title: '确认兑换',
      content: `确定使用 ${pointsRequired} 碳积分兑换该商品吗？`,
      confirmText: '确认兑换',
      confirmColor: '#4ade80'
    });

    if (confirmResult.confirm) {
      wx.showLoading({ title: '兑换中...' });

      try {
        // 创建一个默认地址（实际应用中应该从用户选择的地址中获取）
        const defaultAddress = {
          name: '默认收货人',
          phone: '13800138000',
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          address: '科技园路1号',
          isDefault: true
        };
        
        console.log('开始兑换商品，商品ID:', this.data.product._id);
        
        const { result } = await wx.cloud.callFunction({
          name: 'exchangeProduct',
          data: {
            productId: this.data.product._id,
            points: pointsRequired,
            address: defaultAddress // 添加地址参数
          }
        });
        
        console.log('兑换商品结果:', result);

        if (result && result.success) {
          wx.hideLoading(); // 确保loading被隐藏
          
          wx.showToast({
            title: '兑换成功',
            icon: 'success'
          });

          // 更新用户积分和商品库存
          this.setData({
            userPoints: Math.max(0, this.data.userPoints - pointsRequired),
            'product.stock': Math.max(0, (this.data.product.stock || 1) - 1)
          });

          // 检查是否还能继续兑换
          this.setData({
            canExchange: this.data.userPoints >= pointsRequired && (this.data.product.stock > 0)
          });
          
          // 1.5秒后跳转到兑换记录页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/me/redemption/redemption'
            });
          }, 1500);
        } else {
          wx.hideLoading(); // 确保loading被隐藏
          
          console.error('兑换失败:', result);
          throw new Error((result && result.error) || '兑换失败，请重试');
        }
      } catch (error) {
        wx.hideLoading(); // 确保loading被隐藏
        
        console.error('兑换商品失败:', error);
        wx.showToast({
          title: typeof error === 'object' ? '兑换失败，请重试' : error.toString(),
          icon: 'none',
          duration: 2000
        });
      }
    }
  },

  // 关闭兑换弹窗
  closeExchangeModal() {
    this.setData({ showExchangeModal: false })
  },

  // 添加到收藏
  addToFavorites() {
    if (!auth.checkLogin()) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.showToast({
      title: '收藏成功',
      icon: 'success'
    })
  },

  // 分享商品
  shareProduct() {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  // 查看全部评价
  viewAllReviews() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return '今天'
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 30) {
      return `${diffDays}天前`
    } else {
      return `${date.getMonth() + 1}-${date.getDate()}`
    }
  },

  // 检查是否为管理员
  checkAdminStatus() {
    // 实现检查是否为管理员的逻辑
    // 这里可以根据实际情况进行修改
    this.setData({ isAdmin: false })
  }
})