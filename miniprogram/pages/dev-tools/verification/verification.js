// pages/dev-tools/verification/verification.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    verificationCode: '',
    verificationResult: null,
    scanning: false,
    location: '线下店铺'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 如果有传入的核销码，直接进行验证
    if (options.code) {
      this.setData({ verificationCode: options.code });
      this.verifyCode();
    }
  },

  /**
   * 输入核销码
   */
  inputVerificationCode(e) {
    this.setData({
      verificationCode: e.detail.value
    });
  },

  /**
   * 扫码
   */
  scanCode() {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: (res) => {
        console.log('扫码结果:', res);
        this.setData({
          verificationCode: res.result,
          scanning: false
        });
        // 自动验证
        this.verifyCode();
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
        this.setData({ scanning: false });
      }
    });
    
    this.setData({ scanning: true });
  },

  /**
   * 验证核销码
   */
  async verifyCode() {
    const { verificationCode, location } = this.data;
    
    if (!verificationCode) {
      wx.showToast({
        title: '请输入或扫描核销码',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({ title: '验证中...' });
    
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'verifyRedemption',
        data: {
          verificationCode,
          location
        }
      });
      
      console.log('核销结果:', result);
      
      wx.hideLoading();
      
      if (result.success) {
        this.setData({
          verificationResult: {
            success: true,
            data: result.data
          }
        });
        
        wx.showToast({
          title: '核销成功',
          icon: 'success'
        });
      } else {
        this.setData({
          verificationResult: {
            success: false,
            error: result.error || '核销失败'
          }
        });
        
        wx.showToast({
          title: result.error || '核销失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('核销失败:', error);
      wx.hideLoading();
      
      this.setData({
        verificationResult: {
          success: false,
          error: error.message || '核销处理出错'
        }
      });
      
      wx.showToast({
        title: '核销处理出错',
        icon: 'none'
      });
    }
  },

  /**
   * 重置
   */
  reset() {
    this.setData({
      verificationCode: '',
      verificationResult: null
    });
  }
}) 