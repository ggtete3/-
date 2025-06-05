const auth = require('../../utils/auth.js');

Page({
  data: {
    isTestMode: false,
    functionName: 'login',
    functionParams: '{}',
    result: '',
    error: '',
    loading: false,
    cloudEnvId: 'prod-8gqray9y9823944c',
    availableFunctions: ['login', 'updateUserProfile', 'initDatabase', 'getProducts', 'getUserProfile', 'submitActivity', 'exchangeProduct', 'getRedemptions']
  },

  onLoad() {
    // 检查当前测试模式状态
    this.setData({
      isTestMode: !!wx.getStorageSync('TEST_MODE')
    });

    // 初始化云环境
    this.initCloud();
  },

  // 初始化云环境
  initCloud() {
    try {
      if (!wx.cloud) {
        this.setData({
          error: '当前微信版本不支持云开发'
        });
        return;
      }

      wx.cloud.init({
        env: this.data.cloudEnvId,
        traceUser: true
      });

      this.setData({
        result: '云环境初始化成功: ' + this.data.cloudEnvId
      });
    } catch (err) {
      this.setData({
        error: '云环境初始化失败: ' + JSON.stringify(err)
      });
    }
  },

  // 切换测试模式
  onTestModeChange(e) {
    const enabled = e.detail.value;
    auth.setTestMode(enabled);
    this.setData({ isTestMode: enabled });

    wx.showToast({
      title: enabled ? '已开启测试模式' : '已关闭测试模式',
      icon: 'success'
    });
  },

  // 清除存储
  clearStorage() {
    wx.showModal({
      title: '确认清除',
      content: '这将清除所有本地存储的数据，包括登录状态和缓存，是否继续？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          });
          
          // 更新页面状态
          this.setData({ isTestMode: false });
        }
      }
    });
  },

  // 输入函数名
  inputFunctionName(e) {
    this.setData({
      functionName: e.detail.value
    });
  },

  // 输入函数参数
  inputFunctionParams(e) {
    this.setData({
      functionParams: e.detail.value
    });
  },

  // 选择云函数
  selectFunction(e) {
    this.setData({
      functionName: e.currentTarget.dataset.name
    });
  },

  // 调用云函数
  callFunction() {
    if (!this.data.functionName) {
      wx.showToast({
        title: '请输入云函数名称',
        icon: 'none'
      });
      return;
    }

    let params = {};
    try {
      if (this.data.functionParams) {
        params = JSON.parse(this.data.functionParams);
      }
    } catch (err) {
      this.setData({
        error: '参数格式错误: ' + err.message
      });
      return;
    }

    this.setData({
      loading: true,
      result: '',
      error: ''
    });

    // 确保云环境已初始化
    this.initCloud();

    wx.cloud.callFunction({
      name: this.data.functionName,
      data: params
    })
    .then(res => {
      this.setData({
        result: JSON.stringify(res, null, 2),
        loading: false
      });
    })
    .catch(err => {
      this.setData({
        error: '调用失败: ' + JSON.stringify(err),
        loading: false
      });
    });
  },
  
  // 创建 users 集合
  createUsersCollection() {
    this.setData({
      loading: true,
      result: '',
      error: ''
    });
    
    // 调用 initDatabase 云函数
    wx.cloud.callFunction({
      name: 'initDatabase',
      data: {
        collections: ['users']
      }
    })
    .then(res => {
      this.setData({
        result: '创建 users 集合成功: ' + JSON.stringify(res, null, 2),
        loading: false
      });
    })
    .catch(err => {
      this.setData({
        error: '创建失败: ' + JSON.stringify(err),
        loading: false
      });
    });
  }
}); 