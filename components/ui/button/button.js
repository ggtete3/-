// 通用按钮组件
Component({
  properties: {
    // 按钮类型：primary, secondary, outline, text, danger
    type: {
      type: String,
      value: 'primary'
    },
    // 按钮尺寸：small, medium, large
    size: {
      type: String,
      value: 'medium'
    },
    // 按钮文字
    text: {
      type: String,
      value: ''
    },
    // 图标
    icon: {
      type: String,
      value: ''
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    // 是否加载中
    loading: {
      type: Boolean,
      value: false
    },
    // 微信开放能力
    openType: {
      type: String,
      value: ''
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

  data: {},

  methods: {
    // 按钮点击事件
    onButtonTap(e) {
      if (this.data.disabled || this.data.loading) {
        return;
      }
      this.triggerEvent('tap', e.detail);
    }
  }
}); 