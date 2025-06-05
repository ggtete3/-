// 占位图片组件
Component({
  properties: {
    // 图片地址
    src: {
      type: String,
      value: ''
    },
    // 图片模式
    mode: {
      type: String,
      value: 'aspectFill'
    },
    // 占位类型：gray, green, blue, pattern
    type: {
      type: String,
      value: 'gray'
    },
    // 占位图标
    icon: {
      type: String,
      value: ''
    },
    // 占位文字
    text: {
      type: String,
      value: ''
    },
    // 默认提示文字
    defaultText: {
      type: String,
      value: '暂无图片'
    },
    // 懒加载
    lazyLoad: {
      type: Boolean,
      value: true
    },
    // 自定义样式类名
    className: {
      type: String,
      value: ''
    },
    // 自定义内联样式
    customStyle: {
      type: String,
      value: ''
    }
  },

  data: {
    error: false
  },

  methods: {
    // 图片加载失败
    onImageError() {
      this.setData({
        error: true
      });
      this.triggerEvent('error');
    },

    // 图片加载成功
    onImageLoad() {
      this.setData({
        error: false
      });
      this.triggerEvent('load');
    }
  }
}); 