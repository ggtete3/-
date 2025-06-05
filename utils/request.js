// 网络请求工具
const config = require('./config.js');

// 请求封装
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = wx.getStorageSync('token');
    
    // 设置请求头
    const header = {
      'content-type': 'application/json'
    };
    
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
    
    // 显示加载提示
    if (options.showLoading !== false) {
      wx.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      });
    }
    
    wx.request({
      url: config.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      timeout: options.timeout || config.timeout,
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200) {
          const data = res.data;
          
          if (data.code === 200) {
            resolve(data);
          } else if (data.code === 401) {
            // token过期，清除登录状态
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
            wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none'
            });
            
            // 跳转到登录页
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/login/login'
              });
            }, 1500);
            
            reject(data);
          } else {
            wx.showToast({
              title: data.message || '请求失败',
              icon: 'none'
            });
            reject(data);
          }
        } else {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求失败:', err);
        
        if (err.errMsg && err.errMsg.includes('timeout')) {
          wx.showToast({
            title: '请求超时，请重试',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none'
          });
        }
        
        reject(err);
      }
    });
  });
}

// GET请求
function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
}

// POST请求
function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

// PUT请求
function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

// DELETE请求
function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

// 上传文件
function uploadFile(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    
    const header = {};
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }
    
    wx.showLoading({
      title: options.loadingText || '上传中...',
      mask: true
    });
    
    wx.uploadFile({
      url: config.baseUrl + options.url,
      filePath: filePath,
      name: options.name || 'image',
      formData: options.formData || {},
      header: header,
      success: (res) => {
        wx.hideLoading();
        
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data);
          } else {
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            });
            reject(data);
          }
        } catch (e) {
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          });
          reject(e);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  uploadFile
}; 