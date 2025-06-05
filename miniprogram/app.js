// app.js
const auth = require('./utils/auth.js');
const config = require('./utils/config.js');

App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloudbase-7gz7y7qd7af829dc', // 使用您实际的环境 ID
        traceUser: true,
      });
      console.log('云开发环境初始化成功');
    }

    console.log('小程序启动');
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 检查更新
    this.checkForUpdate();
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  onError(error) {
    console.error('小程序发生错误:', error);
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = auth.checkLogin();
    console.log('登录状态:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('用户未登录');
    } else {
      const userInfo = auth.getCurrentUser();
      console.log('当前用户:', userInfo);
    }
  },

  // 检查小程序更新
  checkForUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate((res) => {
        console.log('检查更新结果:', res.hasUpdate);
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(() => {
        console.log('新版本下载失败');
      });
    }
  },

  // 全局数据
  globalData: {
    userInfo: null,
    systemInfo: null,
    apiBase: config.baseUrl
  },

  // 获取系统信息
  getSystemInfo() {
    if (!this.globalData.systemInfo) {
      this.globalData.systemInfo = wx.getSystemInfoSync();
    }
    return this.globalData.systemInfo;
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
  },

  // 获取用户信息
  getUserInfo() {
    return this.globalData.userInfo || auth.getCurrentUser();
  }
});
