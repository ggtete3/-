// 配置文件
const config = {
  // API基础地址
  // 生产环境地址（需要在微信公众平台配置域名白名单）
  baseUrl: 'https://api.example.com/api',
  
  // 开发测试环境 - 宝塔服务器配置
  // baseUrl: 'http://your-server-ip/api',
  
  // 本地开发环境 - 使用FastAdmin作为后端
  baseUrl: 'http://localhost:8000/api',
  
  // 微信小程序配置
  appId: 'wxa89b436b8a4f22bc', // 请填写您的微信小程序AppID
  
  // 腾讯地图API密钥（用于位置服务）
  mapKey: '', // 请填写您的腾讯地图密钥
  
  // 请求超时时间
  timeout: 10000,
  
  // 默认头像
  defaultAvatar: '/static/images/default-avatar.png',
  
  // 积分规则说明
  pointsRules: {
    'bus': { name: '公交出行', points: '50-200分', icon: 'bus' },
    'cycling': { name: '骑行', points: '30-150分', icon: 'bicycle' },
    'walking': { name: '健康步行', points: '20-100分', icon: 'walking' },
    'recycling': { name: '垃圾分类', points: '10-50分', icon: 'recycle' },
    'no_disposable_cup': { name: '自带餐具', points: '20-80分', icon: 'utensils' }
  }
};

module.exports = config; 