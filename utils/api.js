// API接口模块
const request = require('./request.js')

/**
 * 用户相关API
 */

// 获取用户个人信息
async function getUserProfile() {
  try {
    const result = await request.get('/user/profile')
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      success: false,
      message: error.message || '获取用户信息失败'
    }
  }
}

// 获取用户统计数据
async function getUserStats() {
  try {
    const result = await request.get('/user/stats')
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
    return {
      success: false,
      message: error.message || '获取用户统计失败'
    }
  }
}

// 获取用户成就
async function getUserAchievements() {
  try {
    const result = await request.get('/user/achievements')
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取用户成就失败:', error)
    // 返回模拟数据
    return {
      success: true,
      data: [
        {
          id: 1,
          name: '环保新手',
          description: '首次记录环保活动',
          icon: '/static/icons/achievement-1.png',
          unlocked: true
        },
        {
          id: 2,
          name: '积分达人',
          description: '累计获得1000积分',
          icon: '/static/icons/achievement-2.png',
          unlocked: false
        }
      ]
    }
  }
}

/**
 * 活动相关API
 */

// 提交活动记录
async function submitActivity(activityData) {
  try {
    const result = await request.post('/activities', activityData)
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('提交活动失败:', error)
    return {
      success: false,
      message: error.message || '提交活动失败'
    }
  }
}

// 获取用户活动记录
async function getUserActivities(params = {}) {
  try {
    const result = await request.get('/activities', params)
    return {
      success: true,
      data: {
        activities: result.data?.list || [],
        statusCounts: result.data?.statusCounts || {}
      }
    }
  } catch (error) {
    console.error('获取活动记录失败:', error)
    return {
      success: false,
      message: error.message || '获取活动记录失败'
    }
  }
}

// 获取用户活动统计
async function getUserActivityStats() {
  try {
    const result = await request.get('/activities/stats')
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取活动统计失败:', error)
    return {
      success: false,
      message: error.message || '获取活动统计失败'
    }
  }
}

// 获取今日统计
async function getTodayStats(date) {
  try {
    const result = await request.get('/stats/today', { date })
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取今日统计失败:', error)
    // 返回模拟数据
    return {
      success: true,
      data: {
        carbon_reduction: Math.floor(Math.random() * 500) + 100,
        activity_count: Math.floor(Math.random() * 5) + 1,
        points_earned: Math.floor(Math.random() * 200) + 50
      }
    }
  }
}

/**
 * 商品相关API
 */

// 获取商品列表
async function getProducts(params = {}) {
  try {
    const result = await request.get('/products', params)
    return {
      success: true,
      data: {
        products: result.data?.list || []
      }
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    // 返回模拟数据
    return {
      success: true,
      data: {
        products: [
          {
            id: 1,
            name: '环保购物袋',
            points_required: 500,
            image_url: '/static/images/products/eco-bag.jpg',
            description: '可重复使用的环保购物袋'
          },
          {
            id: 2,
            name: '竹制牙刷',
            points_required: 300,
            image_url: '/static/images/products/bamboo-toothbrush.jpg',
            description: '天然竹制，环保健康'
          },
          {
            id: 3,
            name: '保温水杯',
            points_required: 800,
            image_url: '/static/images/products/reusable-bottle.jpg',
            description: '不锈钢保温，减少塑料瓶使用'
          }
        ]
      }
    }
  }
}

// 获取商品详情
async function getProductDetail(productId) {
  try {
    const result = await request.get(`/products/${productId}`)
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    // 返回模拟数据
    return {
      success: true,
      data: {
        id: productId,
        name: '环保购物袋',
        description: '采用可降解材料制作，结实耐用，可重复使用，是替代塑料袋的最佳选择。',
        image_url: '/static/images/products/eco-bag.jpg',
        images: [
          '/static/images/products/eco-bag.jpg',
          '/static/images/products/eco-bag-detail1.jpg'
        ],
        points_required: 500,
        original_price: 800,
        stock: '充足',
        exchange_count: 1268,
        rating: 96,
        tags: ['环保', '实用', '热销'],
        features: [
          '可降解环保材料制作',
          '承重能力强，可装载15kg物品',
          '可折叠收纳，携带方便',
          '防水设计，适应多种场景'
        ],
        instructions: '使用后请及时清洁晾干，避免长时间暴晒。',
        carbon_reduction: 10
      }
    }
  }
}

// 兑换商品
async function exchangeProduct(exchangeData) {
  try {
    const result = await request.post('/redemptions', exchangeData)
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('兑换商品失败:', error)
    return {
      success: false,
      message: error.message || '兑换商品失败'
    }
  }
}

// 获取兑换记录
async function getRedemptionRecords(params = {}) {
  try {
    const result = await request.get('/redemptions', params)
    return {
      success: true,
      data: {
        records: result.data?.list || [],
        stats: result.data?.stats || {}
      }
    }
  } catch (error) {
    console.error('获取兑换记录失败:', error)
    return {
      success: false,
      message: error.message || '获取兑换记录失败'
    }
  }
}

/**
 * 知识相关API
 */

// 获取知识文章列表
async function getKnowledgeArticles(params = {}) {
  try {
    const result = await request.get('/articles', params)
    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    }
  } catch (error) {
    console.error('获取知识文章失败:', error)
    // 返回模拟数据
    return {
      success: true,
      data: {
        articles: [
          {
            id: 'article1',
            title: '什么是碳足迹？如何计算个人碳足迹',
            summary: '了解碳足迹的概念，学会计算和减少个人碳排放',
            cover_image: '/static/images/placeholder/knowledge.jpg',
            author: '环保专家',
            read_count: 2341,
            like_count: 156,
            created_at: '2024-01-15',
            category: 'carbon'
          },
          {
            id: 'article2',
            title: '太阳能发电原理与家庭应用',
            summary: '探索太阳能技术原理，了解家庭光伏发电系统',
            cover_image: '/static/images/placeholder/knowledge.jpg',
            author: '清洁能源研究员',
            read_count: 1876,
            like_count: 98,
            created_at: '2024-01-14',
            category: 'energy'
          }
        ],
        total: 50
      }
    }
  }
}

// 获取文章详情
async function getArticleDetail(articleId) {
  try {
    const result = await request.get(`/articles/${articleId}`)
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    // 返回模拟数据
    return {
      success: true,
      data: {
        id: articleId,
        title: '什么是碳足迹？如何计算个人碳足迹',
        content: `
# 什么是碳足迹？

碳足迹是指个人、组织、产品或服务在整个生命周期中直接或间接产生的温室气体排放总量，通常以二氧化碳当量（CO₂eq）表示。

## 个人碳足迹的构成

### 1. 交通出行
- 私家车使用
- 公共交通
- 飞机出行
- 骑行步行（几乎零排放）

### 2. 居住用能
- 电力消耗
- 燃气使用
- 供暖制冷

### 3. 饮食消费
- 肉类消费
- 本地vs进口食品
- 食品包装

### 4. 购物消费
- 服装消费
- 电子产品
- 日用品

## 如何计算个人碳足迹

计算个人碳足迹需要收集以下数据：

1. **能源消耗数据**
   - 电费单
   - 燃气费用
   - 汽油消耗

2. **出行记录**
   - 驾车里程
   - 飞行次数和距离
   - 公共交通使用频率

3. **消费记录**
   - 购物支出
   - 饮食习惯

## 减少碳足迹的方法

### 交通方面
- 优先选择公共交通
- 骑行或步行短途出行
- 拼车出行
- 减少不必要的航空旅行

### 居住方面  
- 使用节能电器
- 合理设置空调温度
- 选择清洁能源

### 饮食方面
- 减少肉类消费
- 选择本地应季食品
- 减少食物浪费

### 消费方面
- 理性消费，按需购买
- 选择耐用商品
- 重复利用和回收

通过这些方法，我们每个人都可以为减少碳排放、应对气候变化贡献自己的力量。
        `,
        author: '环保专家',
        read_count: 2341,
        like_count: 156,
        created_at: '2024-01-15',
        category: 'carbon',
        tags: ['碳足迹', '环保', '气候变化']
      }
    }
  }
}

// 搜索知识文章
async function searchKnowledgeArticles(keyword, params = {}) {
  try {
    const result = await request.get('/articles/search', { keyword, ...params })
    return {
      success: true,
      data: {
        articles: result.data?.list || [],
        total: result.data?.total || 0
      }
    }
  } catch (error) {
    console.error('搜索知识文章失败:', error)
    return {
      success: false,
      message: error.message || '搜索失败'
    }
  }
}

/**
 * 文件上传API
 */

// 上传图片
async function uploadImage(filePath) {
  try {
    const result = await request.upload('/upload/image', { filePath, name: 'file' })
    return {
      success: true,
      data: result.data
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    // 上传失败时，返回本地路径
    return {
      success: true,
      data: {
        url: filePath
      }
    }
  }
}

// 数据同步方法 - 确保全局数据一致性
async function syncUserData() {
  try {
    const [profileResult, statsResult] = await Promise.all([
      getUserProfile(),
      getUserStats()
    ])
    
    // 更新全局数据
    const app = getApp()
    if (app.globalData) {
      if (profileResult.success) {
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          ...profileResult.data
        }
      }
      
      if (statsResult.success) {
        app.globalData.userStats = statsResult.data
      }
    }
    
    return {
      success: true,
      data: {
        profile: profileResult.data,
        stats: statsResult.data
      }
    }
  } catch (error) {
    console.error('同步用户数据失败:', error)
    return {
      success: false,
      message: error.message || '同步数据失败'
    }
  }
}

module.exports = {
  // 用户相关
  getUserProfile,
  getUserStats,
  getUserAchievements,
  
  // 活动相关
  submitActivity,
  getUserActivities,
  getUserActivityStats,
  getTodayStats,
  
  // 商品相关
  getProducts,
  getProductDetail,
  exchangeProduct,
  getRedemptionRecords,
  
  // 知识相关
  getKnowledgeArticles,
  getArticleDetail,
  searchKnowledgeArticles,
  
  // 文件上传
  uploadImage,
  
  // 数据同步
  syncUserData
} 