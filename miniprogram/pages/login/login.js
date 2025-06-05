// 登录页面
const auth = require('../../utils/auth.js');

Page({
  data: {
    loginLoading: false,
    showAuthModal: false
  },

  onLoad(options) {
    console.log('登录页面加载，参数:', options)
    
    // 检查是否已登录
    if (auth.checkLogin()) {
      console.log('用户已登录，直接跳转')
      this.redirectToMain();
      return;
    }

    // 保存重定向URL，需要解码URL编码
    if (options.redirect) {
      try {
        this.redirectUrl = decodeURIComponent(options.redirect);
        console.log('解码后的重定向URL:', this.redirectUrl)
      } catch (error) {
        console.error('URL解码失败:', error)
        this.redirectUrl = '/pages/index/index';
      }
    } else {
      this.redirectUrl = '/pages/index/index';
    }
    console.log('设置重定向URL:', this.redirectUrl)
  },

  // 微信登录
  async handleWechatLogin() {
    if (this.data.loginLoading) return;

    this.setData({ loginLoading: true });

    try {
      console.log('开始微信登录流程')
      
      // 执行登录
      const result = await auth.login();
      
      if (result.success) {
        console.log('登录成功:', result.user)
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          this.redirectToMain();
        }, 1000); // 减少延迟时间，提升用户体验
      } else {
        console.log('登录失败，需要用户授权')
        // 登录失败，显示授权弹窗
        this.setData({ showAuthModal: true });
      }
    } catch (error) {
      console.error('登录过程出错:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loginLoading: false });
    }
  },

  // 获取用户信息授权
  async getUserProfile(e) {
    try {
      console.log('开始获取用户信息授权')
      wx.showLoading({
        title: '授权中...',
        mask: true
      });
      
      // 获取用户信息
      const userInfo = await auth.getUserProfile();
      console.log('获取用户信息成功:', userInfo)
      
      // 即使用户拒绝授权，我们也可以使用默认的用户信息
      // 更新用户信息
      const updateResult = await auth.updateUserProfile(userInfo);
      
      wx.hideLoading();
      
      if (updateResult.success) {
        console.log('用户信息更新成功')
        
        wx.showToast({
          title: '授权成功',
          icon: 'success'
        });

        this.setData({ showAuthModal: false });
        
        setTimeout(() => {
          this.redirectToMain();
        }, 1000);
      } else {
        throw new Error(updateResult.error || '更新用户信息失败');
      }
    } catch (error) {
      wx.hideLoading();
      console.error('获取用户信息失败:', error);
      
      if (error.errMsg && error.errMsg.includes('deny')) {
        wx.showModal({
          title: '授权提示',
          content: '您拒绝了授权，将以游客身份使用小程序，部分功能可能受限。',
          showCancel: false,
          success: () => {
            this.setData({ showAuthModal: false });
            this.redirectToMain();
          }
        });
      } else {
        wx.showToast({
          title: '授权失败，请重试',
          icon: 'none'
        });
        
        this.setData({ showAuthModal: false });
      }
    }
  },

  // 关闭授权弹窗
  closeAuthModal() {
    this.setData({ showAuthModal: false });
  },

  // 显示隐私政策
  showPrivacy() {
    wx.showModal({
      title: '用户协议与隐私政策',
      content: '感谢您使用孝碳江湖小程序。我们将严格保护您的隐私信息，仅用于提供更好的服务。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 跳转到目标页面
  redirectToMain() {
    console.log('准备跳转到:', this.redirectUrl)
    
    // 验证重定向URL格式
    if (!this.redirectUrl || 
        this.redirectUrl === '/pages/login/login' ||
        !this.redirectUrl.startsWith('/pages/')) {
      console.log('重定向URL无效，跳转到默认首页')
      wx.switchTab({
        url: '/pages/home/home',
        success: () => {
          console.log('成功跳转到首页')
        },
        fail: (err) => {
          console.error('跳转首页失败:', err)
        }
      });
      return;
    }
    
    // 根据app.json中的tabBar配置，真正的Tab页面只有这些
    const tabPages = [
      '/pages/home/home',        // 首页
      '/pages/activities/activities',  // 低碳生活
      '/pages/mall/mall',        // 积分商城
      '/pages/me/me'            // 我的
    ];
    
    const isTabPage = tabPages.includes(this.redirectUrl);
    
    if (isTabPage) {
      console.log('跳转到Tab页面:', this.redirectUrl)
      wx.switchTab({
        url: this.redirectUrl,
        success: () => {
          console.log('Tab页面跳转成功')
          // 延迟一点触发目标页面的数据刷新
          setTimeout(() => {
            const pages = getCurrentPages()
            const currentPage = pages[pages.length - 1]
            if (currentPage && currentPage.checkLoginStatusAndUpdate) {
              currentPage.checkLoginStatusAndUpdate()
            }
          }, 200)
        },
        fail: (err) => {
          console.error('Tab页面跳转失败:', err)
          // 如果Tab跳转失败，跳转到首页
          wx.switchTab({ 
            url: '/pages/home/home',
            success: () => {
              console.log('降级跳转到首页成功')
            }
          });
        }
      });
    } else {
      console.log('跳转到普通页面:', this.redirectUrl)
      wx.redirectTo({
        url: this.redirectUrl,
        success: () => {
          console.log('普通页面跳转成功')
        },
        fail: (err) => {
          console.error('页面跳转失败:', err)
          // 如果跳转失败，回到首页
          wx.switchTab({ 
            url: '/pages/home/home',
            success: () => {
              console.log('降级跳转到首页成功')
            }
          });
        }
      });
    }
  },
}); 