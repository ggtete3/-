// 通用卡片组件
Component({
  properties: {
    // 卡片标题
    title: {
      type: String,
      value: ''
    },
    // 右上角额外内容
    extra: {
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
    },
    // 是否有底部
    hasFooter: {
      type: Boolean,
      value: false
    }
  },

  data: {},

  methods: {
    // 卡片点击事件
    onCardTap() {
      this.triggerEvent('tap');
    }
  }
}); 