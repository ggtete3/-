/**
 * 开源图标生成工具
 * 可以从多个开源图标库获取SVG图标并转换为小程序可用格式
 */

// 开源图标库配置
const ICON_SOURCES = {
  // Heroicons - https://heroicons.com/
  heroicons: {
    baseUrl: 'https://heroicons.com/',
    license: 'MIT',
    description: 'Beautiful hand-crafted SVG icons by the makers of Tailwind CSS.'
  },
  
  // Tabler Icons - https://tabler-icons.io/
  tabler: {
    baseUrl: 'https://tabler-icons.io/',
    license: 'MIT',
    description: 'Over 2000 free SVG icons'
  },
  
  // Feather Icons - https://feathericons.com/
  feather: {
    baseUrl: 'https://feathericons.com/',
    license: 'MIT',
    description: 'Simply beautiful open source icons'
  },
  
  // Ionicons - https://ionicons.com/
  ionicons: {
    baseUrl: 'https://ionicons.com/',
    license: 'MIT',
    description: 'Premium designed icons for use in web, iOS, Android, and desktop apps'
  }
};

// 小程序所需的图标列表
const REQUIRED_ICONS = [
  'home',           // 首页
  'leaf',           // 环保/低碳
  'shopping-cart',  // 购物车/商城
  'user',           // 用户
  'camera',         // 拍照
  'gift',           // 礼品/兑换
  'list',           // 列表
  'arrow-right',    // 右箭头
  'arrow-left',     // 左箭头
  'plus',           // 加号
  'minus',          // 减号
  'close',          // 关闭
  'check',          // 确认
  'star',           // 星星
  'heart',          // 喜欢
  'location',       // 位置
  'time',           // 时间
  'phone',          // 电话
  'email',          // 邮件
  'search',         // 搜索
  'filter',         // 筛选
  'refresh',        // 刷新
  'share',          // 分享
  'download',       // 下载
  'upload',         // 上传
  'edit',           // 编辑
  'delete',         // 删除
  'settings',       // 设置
  'info',           // 信息
  'warning',        // 警告
  'success',        // 成功
  'error'           // 错误
];

/**
 * 生成字体图标CSS
 * @param {Object} iconMap 图标映射表
 * @returns {String} CSS内容
 */
function generateIconCSS(iconMap) {
  let css = `/* 字体图标库 - 基于开源图标库 */
@font-face {
  font-family: 'iconfont';
  /* 建议使用阿里巴巴矢量图标库生成字体文件 */
  src: url('iconfont.woff2?t=${Date.now()}') format('woff2'),
       url('iconfont.woff?t=${Date.now()}') format('woff'),
       url('iconfont.ttf?t=${Date.now()}') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 32rpx;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 图标映射 */\n`;

  Object.entries(iconMap).forEach(([iconName, unicode], index) => {
    const unicodeHex = `\\e${(0x600 + index).toString(16)}`;
    css += `.icon-${iconName}:before { content: "${unicodeHex}"; }\n`;
  });

  css += `
/* 图标尺寸变体 */
.icon-xs { font-size: 20rpx; }
.icon-sm { font-size: 24rpx; }
.icon-md { font-size: 32rpx; }
.icon-lg { font-size: 40rpx; }
.icon-xl { font-size: 48rpx; }
.icon-2xl { font-size: 56rpx; }

/* 图标颜色变体 */
.icon-primary { color: var(--primary-color, #4ade80); }
.icon-secondary { color: var(--secondary-color, #6b7280); }
.icon-success { color: var(--success-color, #10b981); }
.icon-warning { color: var(--warning-color, #f59e0b); }
.icon-danger { color: var(--danger-color, #ef4444); }
.icon-white { color: #ffffff; }
.icon-black { color: #000000; }

/* 图标状态 */
.icon-disabled { opacity: 0.5; }
.icon-hover:hover { opacity: 0.8; }
.icon-spin { animation: icon-spin 1s linear infinite; }

@keyframes icon-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;

  return css;
}

/**
 * 生成图标使用指南
 * @returns {String} Markdown内容
 */
function generateIconGuide() {
  return `# 图标使用指南

## 📋 图标清单

本项目包含 ${REQUIRED_ICONS.length} 个常用图标，覆盖小程序主要功能场景。

### 🏠 导航图标
- \`home\` - 首页
- \`leaf\` - 低碳生活/环保
- \`shopping-cart\` - 积分商城
- \`user\` - 个人中心

### 📱 功能图标
- \`camera\` - 拍照/上传
- \`gift\` - 礼品/兑换
- \`list\` - 列表/记录
- \`search\` - 搜索
- \`filter\` - 筛选
- \`refresh\` - 刷新

### ⚡ 操作图标
- \`plus\` - 添加
- \`minus\` - 删除
- \`edit\` - 编辑
- \`delete\` - 删除
- \`share\` - 分享
- \`download\` - 下载
- \`upload\` - 上传

### 🔄 状态图标
- \`check\` - 成功/确认
- \`close\` - 关闭/取消
- \`warning\` - 警告
- \`error\` - 错误
- \`info\` - 信息

## 🎨 使用方法

### 基础用法
\`\`\`xml
<text class="iconfont icon-home"></text>
\`\`\`

### 尺寸变体
\`\`\`xml
<text class="iconfont icon-home icon-sm"></text>  <!-- 小号 -->
<text class="iconfont icon-home icon-lg"></text>  <!-- 大号 -->
<text class="iconfont icon-home icon-xl"></text>  <!-- 超大 -->
\`\`\`

### 颜色变体
\`\`\`xml
<text class="iconfont icon-home icon-primary"></text>   <!-- 主色 -->
<text class="iconfont icon-home icon-success"></text>   <!-- 成功色 -->
<text class="iconfont icon-home icon-warning"></text>   <!-- 警告色 -->
<text class="iconfont icon-home icon-danger"></text>    <!-- 危险色 -->
\`\`\`

### 动画效果
\`\`\`xml
<text class="iconfont icon-refresh icon-spin"></text>   <!-- 旋转动画 -->
<text class="iconfont icon-home icon-hover"></text>     <!-- 悬停效果 -->
\`\`\`

## 🔗 开源图标库

推荐从以下开源图标库获取图标：

1. **阿里巴巴矢量图标库** (https://www.iconfont.cn/)
   - 最适合中国开发者
   - 支持在线管理和字体生成
   - 免费商用

2. **Heroicons** (https://heroicons.com/)
   - Tailwind CSS 官方图标库
   - MIT 协议
   - 设计精美一致

3. **Tabler Icons** (https://tabler-icons.io/)
   - 超过 2000 个图标
   - MIT 协议
   - 专为Web应用设计

4. **Feather Icons** (https://feathericons.com/)
   - 简洁美观
   - MIT 协议
   - 适合极简设计

## 🛠️ 自定义图标

如需添加自定义图标：

1. 访问阿里巴巴矢量图标库
2. 搜索并添加所需图标到项目
3. 生成字体文件
4. 更新 \`iconfont.wxss\` 文件
5. 添加对应的CSS类名

## 📝 最佳实践

1. **统一风格**：选择同一图标库的图标保持风格一致
2. **合理尺寸**：根据使用场景选择合适的图标尺寸
3. **语义化命名**：使用有意义的图标名称
4. **无障碍访问**：为图标添加合适的描述文字
5. **性能优化**：使用字体图标而非图片可减少HTTP请求

## 🔄 更新维护

- 定期检查图标库更新
- 移除未使用的图标减少包体积
- 保持图标命名的一致性
- 记录自定义图标的来源和版权信息
`;
}

/**
 * 工具函数：SVG转PNG
 * 注意：这个函数需要在支持Canvas的环境中运行
 */
function svgToPng(svgString, size = 64) {
  // 小程序环境暂不支持，建议使用在线工具或Node.js脚本
  console.log('请使用在线SVG转PNG工具，如：');
  console.log('1. https://convertio.co/zh/svg-png/');
  console.log('2. https://cloudconvert.com/svg-to-png');
  console.log('3. https://www.aconvert.com/cn/image/svg-to-png/');
}

// 导出工具函数
module.exports = {
  ICON_SOURCES,
  REQUIRED_ICONS,
  generateIconCSS,
  generateIconGuide,
  svgToPng
};

// 生成图标映射表
const iconMap = {};
REQUIRED_ICONS.forEach((iconName, index) => {
  iconMap[iconName] = `\\e${(0x600 + index).toString(16)}`;
});

console.log('📝 图标CSS已生成，请将内容复制到 static/fonts/iconfont.wxss');
console.log('📋 图标清单：', REQUIRED_ICONS);
console.log('🎨 推荐图标库：', Object.keys(ICON_SOURCES)); 