// pages/activities/submit/submit.js
const api = require('../../../utils/api')
const auth = require('../../../utils/auth')
const config = require('../../../utils/config')
const app = getApp() // 获取App实例以访问globalData

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityTypes: [], // 将从API加载
    typeIndex: 0,
    description: '',
    images: [],
    canSubmit: false,
    expectedPoints: 0,
    latitude: null,
    longitude: null,
    locationName: '',
    locationAddress: '',
    locationInfo: '点击选择位置',
    locationAuthDenied: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!auth.checkLogin()) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login?redirect=' + encodeURIComponent('/pages/activities/submit/submit')
        })
      }, 1500)
      return
    }
    
    this.initPage()
    this.loadActivityTypes()

    // 如果有传入活动类型，设置对应的索引
    if (options.type) {
      const index = this.data.activityTypes.findIndex(item => item.type === options.type);
      if (index !== -1) {
        this.setData({ typeIndex: index });
        this.calculatePoints();
      }
    }
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
    // 检查登录状态
    if (!auth.checkLogin()) {
      wx.navigateBack()
      return
    }
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
    this.loadActivityTypes()
    wx.stopPullDownRefresh()
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
      title: '孝碳江湖 - 一起记录低碳生活',
      desc: '用行动守护地球，获取积分奖励！',
      path: '/pages/activities/submit/submit'
    }
  },

  // 初始化页面
  initPage() {
    // 设置今天的日期
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    this.setData({ 
      selectedDate: todayStr,
      today: todayStr
    })
  },

  // 加载活动类型
  async loadActivityTypes() {
    console.log('[ActivitySubmit] Attempting to load activity types...');
    const defaultTypes = [
      { name: '加载中...', type: 'loading', points: 0 }
    ];
    this.setData({ activityTypes: defaultTypes, typeIndex: 0 }); // Show loading state

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getActivityTypes',
        data: { status: 'active' }
      });

      console.log('[ActivitySubmit] Cloud function response for activity types:', result);

      if (result && result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
        const formattedTypes = result.data.map(item => ({
          name: item.title || item.name || '',    // 使用title或name作为显示名称
          type: item.type || '',                  // 使用type作为内部标识
          points: item.points || 0                // 使用points作为基础积分
        }));
        this.setData({
          activityTypes: formattedTypes
        });
        console.log('[ActivitySubmit] Loaded activity types:', formattedTypes);
      } else {
        console.error('[ActivitySubmit] Cloud function for activity types failed or returned empty data:', result ? result.error : 'No result');
        this.setData({ 
          activityTypes: [{ name: '加载失败', type: 'error', points: 0 }]
        });
      }
    } catch (error) {
      console.error('[ActivitySubmit] Error loading activity types via cloud function:', error);
      this.setData({ 
        activityTypes: [{ name: '加载异常', type: 'exception', points: 0 }]
      });
    }
    // 确保在类型加载或失败后，根据当前选中的类型（可能是第一个）重新计算积分和检查提交状态
    this.setData({ typeIndex: 0 }); // 默认选中第一个，或根据传入的type重新定位
    this.calculatePoints(); 
    this.checkCanSubmit();
  },

  // 选择活动类型
  onTypeChange(e) {
    console.log('[ActivitySubmit] onTypeChange triggered. Event detail value:', e.detail.value);
    const newIndex = e.detail.value;
    this.setData({
      typeIndex: newIndex
    });
    console.log('[ActivitySubmit] activityTypes:', this.data.activityTypes);
    if (this.data.activityTypes && this.data.activityTypes.length > newIndex) {
      console.log('[ActivitySubmit] Selected activity type:', this.data.activityTypes[newIndex]);
    } else {
      console.warn('[ActivitySubmit] Selected typeIndex might be out of bounds or activityTypes is not set.');
    }
    this.calculatePoints();
    this.checkCanSubmit();
  },

  // 输入活动描述
  onDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 选择图片
  async chooseImage() {
    try {
      const res = await wx.chooseImage({
        count: 3 - this.data.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      const images = [...this.data.images, ...res.tempFilePaths];
      this.setData({ images });
      this.checkCanSubmit();
    } catch (err) {
      console.error('选择图片失败:', err);
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: this.data.images,
      current: url
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
    this.checkCanSubmit();
  },

  // 计算预期积分
  calculatePoints() {
    console.log('[ActivitySubmit] calculatePoints called.');
    console.log('[ActivitySubmit] Current typeIndex:', this.data.typeIndex);
    console.log('[ActivitySubmit] Current activityTypes:', this.data.activityTypes);

    if (!this.data.activityTypes || this.data.activityTypes.length === 0) {
      console.warn('[ActivitySubmit] activityTypes is empty or not set. Cannot calculate points.');
      this.setData({ expectedPoints: 0 });
      return;
    }

    const currentType = this.data.activityTypes[this.data.typeIndex];
    if (!currentType || typeof currentType.points === 'undefined') {
      console.warn('[ActivitySubmit] Selected activity type is invalid or has no points defined:', currentType);
      this.setData({ expectedPoints: 0 });
      return;
    }

    const basePoints = currentType.points;
    const expectedPoints = Math.floor(basePoints);
    console.log('[ActivitySubmit] Calculated expectedPoints:', expectedPoints);
    this.setData({ expectedPoints });
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const canSubmit = this.data.images.length > 0;
    this.setData({ canSubmit });
  },

  // 提交活动
  async submitActivity() {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '提交中...' });

    try {
      const uploadedImageUrls = [];
      if (this.data.images.length > 0) {
        for (const imagePath of this.data.images) {
          const result = await this.uploadFile(imagePath);
          if (result && result.fileID) {
            uploadedImageUrls.push(result.fileID);
          } else {
            console.warn('有图片上传失败:', imagePath, result && result.error ? result.error : '');
          }
        }
      }
      
      const selectedType = this.data.activityTypes[this.data.typeIndex];
      
      const activityData = {
        activity_type_id: selectedType.type,
        description: this.data.description,
        image_url: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : '',
        carbon_date: new Date().toISOString().split('T')[0],
        location_name: this.data.locationName || '',
        location_address: this.data.locationAddress || '',
        location_latitude: this.data.latitude || 0,
        location_longitude: this.data.longitude || 0
      };

      console.log('[ActivitySubmit] 提交数据:', activityData);

      const { result } = await wx.cloud.callFunction({
        name: 'submitActivity',
        data: activityData
      });

      if (result && result.success) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });

        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        throw new Error((result && result.error) || '提交失败');
      }
    } catch (err) {
      console.error('提交活动失败:', err);
      wx.showToast({
        title: '提交失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 上传文件到云存储
  async uploadFile(filePath) {
    const ext = filePath.split('.').pop();
    const cloudPath = `activities/${Date.now()}-${Math.random().toString(36).slice(-6)}.${ext}`;

    try {
      const { fileID } = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      });

      return { fileID };
    } catch (error) {
      console.error('上传文件失败:', error);
      return { error };
    }
  },

  // 获取位置
  async getLocation() {
    try {
      // 检查权限
      const setting = await wx.getSetting();
      if (!setting.authSetting['scope.userLocation']) {
        await wx.authorize({ scope: 'scope.userLocation' });
      }

      // 调用选择位置接口
      const location = await wx.chooseLocation();
      
      if (location) {
        this.setData({
          location: {
            name: location.name,
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude
          },
          locationAuthDenied: false
        }, () => {
          this.checkCanSubmit();
        });
      }
    } catch (error) {
      console.error('选择位置失败:', error);
      
      if (error.errMsg.includes('auth deny')) {
        this.setData({ locationAuthDenied: true });
        wx.showToast({
          title: '需要位置权限',
          icon: 'none'
        });
      } else if (!error.errMsg.includes('cancel')) {
        wx.showToast({
          title: '选择位置失败',
          icon: 'none'
        });
      }
    }
  }
});