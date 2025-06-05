// 认证工具
const request = require('./request.js');

// 检查登录状态
function checkLogin() {
  const token = wx.getStorageSync('token');
  const userInfo = wx.getStorageSync('userInfo');
  
  return !!(token && userInfo);
}

// 微信登录
function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error('获取微信登录code失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 获取用户信息授权 (REMOVED - This should be triggered by user tap in the page)
// function getUserProfile() {
//   return new Promise((resolve, reject) => {
//     wx.getUserProfile({
//       desc: '用于完善用户资料',
//       success: (res) => {
//         resolve(res.userInfo);
//       },
//       fail: (err) => {
//         reject(err);
//       }
//     });
//   });
// }

// 登录流程
async function login() {
  try {
    // 1. 获取微信登录code
    const code = await wxLogin();
    
    // 2. 发送登录请求
    const loginRes = await request.post('/auth/login', { code });
    
    if (loginRes.code === 200) {
      // 3. 保存token和用户信息
      wx.setStorageSync('token', loginRes.data.token);
      wx.setStorageSync('userInfo', loginRes.data.user);
      
      // 4. 更新全局用户信息
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.userInfo = loginRes.data.user;
      }
      
      return {
        success: true,
        user: loginRes.data.user
      };
    } else {
      throw new Error(loginRes.message || '登录失败');
    }
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      error: error.message || '登录失败'
    };
  }
}

// 更新用户信息
async function updateUserProfile(userInfo) {
  try {
    const code = await wxLogin();
    
    const updateRes = await request.post('/auth/update-profile', {
      code,
      userInfo
    });
    
    if (updateRes.code === 200) {
      // 更新本地存储的用户信息
      wx.setStorageSync('userInfo', updateRes.data.user);
      
      // 更新全局用户信息
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.userInfo = updateRes.data.user;
      }
      
      return {
        success: true,
        user: updateRes.data.user
      };
    } else {
      throw new Error(updateRes.message || '更新用户信息失败');
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return {
      success: false,
      error: error.message || '更新用户信息失败'
    };
  }
}

// 登出
function logout() {
  clearUserData();
  
  wx.reLaunch({
    url: '/pages/login/login'
  });
}

// 获取当前用户信息
function getCurrentUser() {
  return wx.getStorageSync('userInfo') || null;
}

// 设置token
function setToken(token) {
  wx.setStorageSync('token', token);
}

// 获取token
function getToken() {
  return wx.getStorageSync('token') || '';
}

// 设置当前用户信息
function setCurrentUser(userInfo) {
  wx.setStorageSync('userInfo', userInfo);
  
  // 同时更新全局用户信息
  const app = getApp();
  if (app && app.globalData) {
    app.globalData.userInfo = userInfo;
  }
}

// 清除用户数据
function clearUserData() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
  
  // 清除全局用户信息
  const app = getApp();
  if (app && app.globalData) {
    app.globalData.userInfo = null;
  }
}

// 统一的登录检查和跳转方法
function requireLoginWithRedirect(currentPath, options = {}) {
  if (!checkLogin()) {
    const { 
      showToast = true, 
      toastTitle = '请先登录', 
      delay = 1500,
      useNavigateTo = false 
    } = options;
    
    if (showToast) {
      wx.showToast({
        title: toastTitle,
        icon: 'none'
      });
    }
    
    // 验证和清理路径
    let cleanPath = currentPath;
    if (!cleanPath || !cleanPath.startsWith('/pages/')) {
      cleanPath = '/pages/home/home';  // 修改默认页面为真正的首页Tab
    }
    
    // 构建登录页面URL，使用encodeURIComponent正确编码重定向参数
    const encodedPath = encodeURIComponent(cleanPath);
    const loginUrl = `/pages/login/login?redirect=${encodedPath}`;
    
    console.log('准备跳转到登录页面:', loginUrl);
    console.log('重定向路径:', cleanPath);
    
    const redirectFn = () => {
      if (useNavigateTo) {
        wx.navigateTo({ 
          url: loginUrl,
          fail: (err) => {
            console.error('跳转登录页面失败:', err);
            // 降级处理，直接跳转到登录页面不带参数
            wx.navigateTo({ url: '/pages/login/login' });
          }
        });
      } else {
        wx.redirectTo({ 
          url: loginUrl,
          fail: (err) => {
            console.error('跳转登录页面失败:', err);
            // 降级处理，直接跳转到登录页面不带参数
            wx.redirectTo({ url: '/pages/login/login' });
          }
        });
      }
    };
    
    if (showToast && delay > 0) {
      setTimeout(redirectFn, delay);
    } else {
      redirectFn();
    }
    
    return false;
  }
  
  return true;
}

// 检查是否需要登录（兼容旧版本）
function requireLogin() {
  if (!checkLogin()) {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    });
    
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }, 1500);
    
    return false;
  }
  
  return true;
}

// 获取当前页面路径（用于重定向）
function getCurrentPagePath() {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1];
    return '/' + currentPage.route;
  }
  return '';
}

// 智能登录检查（自动获取当前页面路径）
function smartRequireLogin(options = {}) {
  const currentPath = getCurrentPagePath();
  return requireLoginWithRedirect(currentPath, options);
}

module.exports = {
  checkLogin,
  wxLogin,
  // getUserProfile, // 已移除，应在页面用户点击时直接调用 wx.getUserProfile
  login,
  updateUserProfile,
  logout,
  getCurrentUser,
  setToken,
  getToken,
  setCurrentUser,
  clearUserData,
  requireLogin,
  requireLoginWithRedirect,
  getCurrentPagePath,
  smartRequireLogin
}; 