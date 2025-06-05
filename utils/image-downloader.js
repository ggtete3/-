/**
 * 图片资源下载工具
 * 从开源图片库下载小程序所需的图片资源
 */

// 开源图片资源配置
const IMAGE_SOURCES = {
  unsplash: {
    name: 'Unsplash',
    baseUrl: 'https://unsplash.com/',
    license: '免费商用',
    description: '高质量免费图片，无需注册'
  },
  pixabay: {
    name: 'Pixabay',
    baseUrl: 'https://pixabay.com/',
    license: '免费商用',
    description: '免费图片、视频、矢量图'
  },
  pexels: {
    name: 'Pexels',
    baseUrl: 'https://www.pexels.com/',
    license: '免费商用',
    description: '免费高质量图片'
  }
};

// 小程序所需的图片资源列表
const REQUIRED_IMAGES = {
  // Tab栏图标 (64x64px PNG)
  icons: [
    {
      name: 'home.png',
      description: '首页图标',
      size: '64x64',
      type: 'icon',
      color: '#6b7280',
      keywords: ['house', 'home', 'navigation']
    },
    {
      name: 'home-active.png',
      description: '首页图标-激活状态',
      size: '64x64',
      type: 'icon',
      color: '#4ade80',
      keywords: ['house', 'home', 'navigation', 'active']
    },
    {
      name: 'leaf.png',
      description: '环保图标',
      size: '64x64',
      type: 'icon',
      color: '#6b7280',
      keywords: ['leaf', 'eco', 'nature', 'environment']
    },
    {
      name: 'leaf-active.png',
      description: '环保图标-激活状态',
      size: '64x64',
      type: 'icon',
      color: '#4ade80',
      keywords: ['leaf', 'eco', 'nature', 'environment', 'active']
    },
    {
      name: 'shop.png',
      description: '商城图标',
      size: '64x64',
      type: 'icon',
      color: '#6b7280',
      keywords: ['shopping', 'cart', 'store', 'mall']
    },
    {
      name: 'shop-active.png',
      description: '商城图标-激活状态',
      size: '64x64',
      type: 'icon',
      color: '#4ade80',
      keywords: ['shopping', 'cart', 'store', 'mall', 'active']
    },
    {
      name: 'user.png',
      description: '用户图标',
      size: '64x64',
      type: 'icon',
      color: '#6b7280',
      keywords: ['user', 'person', 'profile', 'account']
    },
    {
      name: 'user-active.png',
      description: '用户图标-激活状态',
      size: '64x64',
      type: 'icon',
      color: '#4ade80',
      keywords: ['user', 'person', 'profile', 'account', 'active']
    }
  ],

  // 占位图片
  placeholders: [
    {
      name: 'product-placeholder.jpg',
      description: '产品占位图',
      size: '400x400',
      type: 'placeholder',
      keywords: ['product', 'item', 'package', 'green', 'eco-friendly']
    },
    {
      name: 'avatar-placeholder.jpg',
      description: '头像占位图',
      size: '200x200',
      type: 'placeholder',
      keywords: ['avatar', 'profile', 'user', 'person', 'default']
    },
    {
      name: 'activity-placeholder.jpg',
      description: '活动占位图',
      size: '400x300',
      type: 'placeholder',
      keywords: ['environment', 'nature', 'activity', 'green', 'eco']
    },
    {
      name: 'mall-banner.jpg',
      description: '商城横幅',
      size: '800x400',
      type: 'banner',
      keywords: ['shopping', 'mall', 'eco-products', 'green', 'sustainable']
    }
  ],

  // 示例产品图片
  products: [
    {
      name: 'eco-bag.jpg',
      description: '环保购物袋',
      size: '400x400',
      type: 'product',
      keywords: ['eco bag', 'reusable', 'shopping bag', 'sustainable']
    },
    {
      name: 'bamboo-toothbrush.jpg',
      description: '竹制牙刷',
      size: '400x400',
      type: 'product',
      keywords: ['bamboo toothbrush', 'eco', 'sustainable', 'dental']
    },
    {
      name: 'reusable-bottle.jpg',
      description: '可重复使用水杯',
      size: '400x400',
      type: 'product',
      keywords: ['reusable bottle', 'water bottle', 'eco', 'sustainable']
    },
    {
      name: 'solar-powerbank.jpg',
      description: '太阳能充电宝',
      size: '400x400',
      type: 'product',
      keywords: ['solar power bank', 'renewable energy', 'sustainable']
    }
  ],

  // 背景图片
  backgrounds: [
    {
      name: 'eco-background.jpg',
      description: '环保主题背景',
      size: '1200x800',
      type: 'background',
      keywords: ['nature', 'forest', 'green', 'environment', 'eco']
    },
    {
      name: 'activity-bg.jpg',
      description: '活动背景',
      size: '1200x600',
      type: 'background',
      keywords: ['outdoor', 'nature', 'activity', 'green', 'lifestyle']
    }
  ]
};

// SVG图标模板
const SVG_ICONS = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>`,
  
  leaf: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>`,
  
  shop: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>`,
  
  user: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`
};

/**
 * 生成SVG图标文件
 * @param {string} iconName 图标名称
 * @param {string} color 图标颜色
 * @returns {string} SVG内容
 */
function generateSVGIcon(iconName, color = '#6b7280') {
  const iconBase = iconName.replace('-active', '');
  const svg = SVG_ICONS[iconBase];
  if (!svg) return null;
  
  return svg.replace('stroke="currentColor"', `stroke="${color}"`);
}

/**
 * 生成图片下载指南
 * @returns {string} Markdown内容
 */
function generateDownloadGuide() {
  return `# 图片资源下载指南

## 📋 所需图片清单

本项目需要以下图片资源来完整运行：

### 🎯 Tab栏图标 (8个)
${REQUIRED_IMAGES.icons.map(img => `- **${img.name}** - ${img.description} (${img.size})`).join('\n')}

### 🖼️ 占位图片 (4个)
${REQUIRED_IMAGES.placeholders.map(img => `- **${img.name}** - ${img.description} (${img.size})`).join('\n')}

### 📦 示例产品图片 (4个)
${REQUIRED_IMAGES.products.map(img => `- **${img.name}** - ${img.description} (${img.size})`).join('\n')}

### 🌄 背景图片 (2个)
${REQUIRED_IMAGES.backgrounds.map(img => `- **${img.name}** - ${img.description} (${img.size})`).join('\n')}

## 🔗 推荐图片来源

### 1. Unsplash (https://unsplash.com/)
**最推荐** - 高质量免费图片，商业使用无限制
- 直接下载高分辨率图片
- 无需注册，但建议注册以获得更好体验
- 搜索关键词示例：
  - 环保图片：\`eco friendly\`, \`sustainable\`, \`green living\`
  - 产品图片：\`eco products\`, \`sustainable products\`, \`green items\`
  - 背景图片：\`nature background\`, \`forest\`, \`green landscape\`

### 2. Pixabay (https://pixabay.com/)
免费图片、视频、矢量图，无需注册
- 支持中文搜索
- 图片质量较高
- 提供不同尺寸下载

### 3. Pexels (https://www.pexels.com/)
免费高质量图片，每周更新
- 简洁的界面
- 高质量图片
- 提供API接口

## 📥 下载步骤

### 方法一：手动下载 (推荐新手)

1. **访问Unsplash官网**
   \`\`\`
   https://unsplash.com/
   \`\`\`

2. **搜索对应关键词**
   - 例如搜索 "eco friendly products" 找产品图片
   - 搜索 "sustainable living" 找活动图片

3. **选择合适图片**
   - 点击图片进入详情页
   - 选择合适的尺寸下载（建议选择Medium或Large）
   - 重命名为项目所需的文件名

4. **放置到对应目录**
   \`\`\`
   static/icons/          # Tab栏图标
   static/images/placeholder/  # 占位图片
   static/images/products/     # 产品图片
   static/images/backgrounds/  # 背景图片
   \`\`\`

### 方法二：使用Unsplash API (适合开发者)

1. **注册Unsplash开发者账号**
   \`\`\`
   https://unsplash.com/developers
   \`\`\`

2. **获取API Key**

3. **使用API下载**
   \`\`\`javascript
   // 示例API调用
   const response = await fetch(\`https://api.unsplash.com/search/photos?query=eco+friendly&client_id=YOUR_API_KEY\`);
   const data = await response.json();
   \`\`\`

## 🎨 图标处理

对于Tab栏图标，建议：

1. **使用SVG转PNG工具**
   - 在线工具：https://convertio.co/zh/svg-png/
   - 设置尺寸为64x64px
   - 导出PNG格式

2. **图标颜色规范**
   - 普通状态：\`#6b7280\` (灰色)
   - 激活状态：\`#4ade80\` (绿色)

3. **图标风格建议**
   - 选择线条图标风格
   - 保持图标简洁清晰
   - 确保在小尺寸下仍然清晰可见

## 📋 具体搜索建议

### Tab栏图标搜索词
- **home**: "house icon", "home outline", "navigation home"
- **leaf**: "leaf icon", "eco icon", "nature symbol"
- **shop**: "shopping cart icon", "store icon", "commerce"
- **user**: "user icon", "profile icon", "person outline"

### 产品图片搜索词
- "eco friendly products"
- "sustainable items"
- "green living products"
- "bamboo products"
- "reusable items"
- "solar powered gadgets"

### 背景图片搜索词
- "green nature background"
- "forest landscape"
- "eco friendly lifestyle"
- "sustainable living"
- "environmental conservation"

## ⚠️ 注意事项

1. **版权确认**
   - 确保所选图片允许商业使用
   - Unsplash图片可以直接商用，无需署名
   - 避免使用有版权争议的图片

2. **图片优化**
   - 压缩图片大小以提高加载速度
   - 使用webp格式可进一步减小体积
   - 建议使用在线图片压缩工具

3. **命名规范**
   - 严格按照项目要求的文件名命名
   - 使用小写字母和连字符
   - 避免使用中文或特殊字符

4. **尺寸规范**
   - Tab栏图标：64x64px
   - 产品图片：建议400x400px
   - 背景图片：建议1200px宽度以上

## 🔄 自动化方案 (高级)

可以创建Node.js脚本自动下载：

\`\`\`javascript
// 安装依赖：npm install axios fs-extra
const axios = require('axios');
const fs = require('fs-extra');

async function downloadImage(url, filepath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });
  
  response.data.pipe(fs.createWriteStream(filepath));
  
  return new Promise((resolve, reject) => {
    response.data.on('end', () => resolve());
    response.data.on('error', reject);
  });
}
\`\`\`

完成图片下载后，项目前端将能够正常显示所有图片资源！
`;
}

/**
 * 生成临时SVG图标文件
 */
function generateTempIcons() {
  const icons = {};
  
  // 生成普通状态图标
  Object.keys(SVG_ICONS).forEach(iconName => {
    icons[`${iconName}.svg`] = generateSVGIcon(iconName, '#6b7280');
    icons[`${iconName}-active.svg`] = generateSVGIcon(iconName, '#4ade80');
  });
  
  return icons;
}

// 导出工具函数
module.exports = {
  IMAGE_SOURCES,
  REQUIRED_IMAGES,
  SVG_ICONS,
  generateSVGIcon,
  generateDownloadGuide,
  generateTempIcons
};

// 控制台输出指导信息
console.log('🖼️  图片资源下载工具已加载');
console.log('📋 需要下载的图片数量：', 
  REQUIRED_IMAGES.icons.length + 
  REQUIRED_IMAGES.placeholders.length + 
  REQUIRED_IMAGES.products.length + 
  REQUIRED_IMAGES.backgrounds.length
);
console.log('🔗 推荐图片来源：', Object.keys(IMAGE_SOURCES));
console.log('📖 运行 generateDownloadGuide() 获取详细下载指南'); 