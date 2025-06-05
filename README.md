# 孝碳江湖小程序

一个基于微信小程序云开发的环保积分兑换平台。用户可以通过参与环保活动获取积分，然后用积分兑换环保商品。

## 功能特点

- 环保活动提交与审核
- 积分商城
- 低碳生活知识库
- 用户积分管理
- 商品兑换系统
- 活动记录查询

## 技术栈

- 微信小程序原生开发
- 微信云开发
  - 云数据库
  - 云函数
  - 云存储

## 项目结构

```
├── cloudfunctions/        # 云函数
│   ├── getProducts/      # 获取商品列表
│   ├── submitActivity/   # 提交活动
│   └── ...
├── miniprogram/          # 小程序代码
│   ├── pages/           # 页面文件
│   ├── components/      # 组件
│   └── utils/          # 工具函数
└── README.md
```

## 数据库设计

### 集合列表

- products: 商品信息
- activities: 活动记录
- users: 用户信息
- redemptions: 兑换记录
- knowledgeArticles: 低碳知识文章

## 本地开发

1. 克隆项目
```bash
git clone [repository-url]
cd eco-carbon-points
```

2. 安装依赖
```bash
# 安装小程序依赖
npm install

# 安装云函数依赖
cd cloudfunctions/[function-name]
npm install
```

3. 导入项目到微信开发者工具

4. 配置云开发环境

## 部署说明

1. 上传云函数
2. 创建数据库集合
3. 导入初始数据
4. 上传云存储文件

## 贡献指南

欢迎提交 Issue 和 Pull Request

## 许可证

MIT License 