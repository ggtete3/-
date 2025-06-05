const app = getApp()

Page({
  data: {
    product: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options
    this.loadProduct(id)
  },

  async loadProduct(id) {
    this.setData({ loading: true })

    try {
      const { data } = await wx.cloud.callFunction({
        name: 'manageProducts',
        data: {
          type: 'getProductById',
          data: { id }
        }
      })

      this.setData({
        product: data.data
      })
    } catch (err) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  onExchange() {
    const { product } = this.data
    if (!product) return

    wx.navigateTo({
      url: `/pages/redemption/index?productId=${product.id}`
    })
  },

  onShareAppMessage() {
    const { product } = this.data
    return {
      title: product ? product.name : '环保商品',
      path: `/pages/product/detail/index?id=${product.id}`
    }
  }
}) 