const app = getApp()
const api = require('../../utils/api')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchKeyword: '',
    currentCategory: 'all',
    sortType: 'latest',
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    categories: [
      { id: 'all', name: '全部', icon: '📚' },
      { id: 'carbon', name: '碳中和', icon: '🌱' },
      { id: 'energy', name: '清洁能源', icon: '⚡' },
      { id: 'transport', name: '绿色出行', icon: '🚲' },
      { id: 'life', name: '绿色生活', icon: '🏠' },
      { id: 'tech', name: '环保科技', icon: '🔬' }
    ],
    featuredArticles: [],
    articles: [],
    quizStatus: '未完成',
    streakDays: 0,
    quizPoints: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData()
    this.checkQuizStatus()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkQuizStatus()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '孝碳江湖 - 低碳知识库',
      desc: '学习环保知识，践行低碳生活',
      path: '/pages/knowledge/knowledge'
    }
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true })
    
    try {
      await Promise.all([
        this.loadFeaturedArticles(),
        this.loadArticles(true)
      ])
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载推荐文章
  async loadFeaturedArticles() {
    try {
      // 模拟推荐文章数据
      const mockFeatured = [
        {
          id: 'featured1',
          title: '碳达峰碳中和100问',
          summary: '全面解读双碳目标，了解绿色发展路径',
          cover_image: '/static/images/placeholder/knowledge.jpg',
          read_count: 1520,
          created_at: '2024-01-15'
        },
        {
          id: 'featured2', 
          title: '新能源汽车发展趋势',
          summary: '探索电动汽车技术革新与市场前景',
          cover_image: '/static/images/placeholder/knowledge.jpg',
          read_count: 980,
          created_at: '2024-01-12'
        },
        {
          id: 'featured3',
          title: '垃圾分类减碳指南',
          summary: '科学分类垃圾，为地球减负担',
          cover_image: '/static/images/placeholder/knowledge.jpg',
          read_count: 756,
          created_at: '2024-01-10'
        }
      ]
      
      this.setData({ featuredArticles: mockFeatured })
    } catch (error) {
      console.error('加载推荐文章失败:', error)
    }
  },

  // 加载文章列表
  async loadArticles(reset = false) {
    if (reset) {
      this.setData({ page: 1, articles: [], hasMore: true })
    }

    if (!this.data.hasMore) return

    try {
      // 模拟文章数据
      const mockArticles = [
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
        },
        {
          id: 'article3',
          title: '公共交通 vs 私家车：碳排放对比',
          summary: '数据分析不同出行方式的环境影响',
          cover_image: '/static/images/placeholder/knowledge.jpg',
          author: '交通环保研究员',
          read_count: 1432,
          like_count: 87,
          created_at: '2024-01-13',
          category: 'transport'
        },
        {
          id: 'article4',
          title: '低碳饮食：如何通过饮食减少碳足迹',
          summary: '饮食选择对环境的影响及低碳饮食建议',
          cover_image: '/static/images/placeholder/knowledge.jpg',
          author: '营养环保专家',
          read_count: 1198,
          like_count: 76,
          created_at: '2024-01-12',
          category: 'life'
        },
        {
          id: 'article5',
          title: '人工智能在环保领域的应用',
          summary: 'AI技术如何助力环境保护和碳减排',
          cover_image: '/static/images/placeholder/knowledge.jpg',
          author: 'AI环保研究员',
          read_count: 892,
          like_count: 45,
          created_at: '2024-01-11',
          category: 'tech'
        }
      ]

      // 根据分类过滤
      let filteredArticles = mockArticles
      if (this.data.currentCategory !== 'all') {
        filteredArticles = mockArticles.filter(article => 
          article.category === this.data.currentCategory
        )
      }

      // 根据搜索关键词过滤
      if (this.data.searchKeyword) {
        filteredArticles = filteredArticles.filter(article =>
          article.title.includes(this.data.searchKeyword) ||
          article.summary.includes(this.data.searchKeyword)
        )
      }

      // 排序
      if (this.data.sortType === 'popular') {
        filteredArticles.sort((a, b) => b.read_count - a.read_count)
      } else {
        filteredArticles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }

      const currentArticles = reset ? [] : this.data.articles
      this.setData({
        articles: [...currentArticles, ...filteredArticles],
        hasMore: filteredArticles.length === this.data.pageSize,
        page: this.data.page + 1
      })
    } catch (error) {
      console.error('加载文章失败:', error)
    }
  },

  // 检查答题状态
  checkQuizStatus() {
    try {
      const today = new Date().toDateString()
      const lastQuizDate = wx.getStorageSync('lastQuizDate')
      const streakDays = wx.getStorageSync('quizStreakDays') || 0
      
      if (lastQuizDate === today) {
        this.setData({ 
          quizStatus: '已完成',
          streakDays: streakDays
        })
      } else {
        this.setData({ 
          quizStatus: '未完成',
          streakDays: streakDays
        })
      }
    } catch (error) {
      console.error('检查答题状态失败:', error)
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  // 搜索确认
  onSearch() {
    this.loadArticles(true)
  },

  // 切换分类
  switchCategory(e) {
    const categoryId = e.currentTarget.dataset.id
    this.setData({ currentCategory: categoryId })
    this.loadArticles(true)
  },

  // 改变排序方式
  changeSortType(e) {
    const sortType = e.currentTarget.dataset.type
    this.setData({ sortType })
    this.loadArticles(true)
  },

  // 加载更多
  loadMore() {
    this.loadArticles(false)
  },

  // 刷新数据
  async refreshData() {
    this.setData({ 
      page: 1, 
      articles: [], 
      featuredArticles: [],
      hasMore: true 
    })
    await this.loadData()
  },

  // 跳转到答题页面
  goToQuiz() {
    wx.showToast({
      title: '答题功能开发中',
      icon: 'none'
    })
  },

  // 跳转到文章详情
  goToArticle(e) {
    const articleId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/knowledge/article/article?id=${articleId}`
    })
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return ''
    
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return '今天'
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return `${date.getMonth() + 1}-${date.getDate()}`
    }
  }
}) 