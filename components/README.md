# UI组件库使用文档

这个小程序项目包含一套完整的UI组件库，基于开源设计系统打造，提供现代化、一致性的用户界面。

## 📦 已包含的组件

### 1. 卡片组件 (ui-card)

通用卡片容器，支持头部、内容区域和底部。

```xml
<!-- 基础用法 -->
<ui-card title="卡片标题">
  卡片内容
</ui-card>

<!-- 带额外信息 -->
<ui-card title="统计数据" extra="查看更多">
  <view>今日积分：100</view>
</ui-card>

<!-- 渐变样式 -->
<ui-card className="gradient" title="特殊卡片">
  渐变背景卡片
</ui-card>
```

**属性说明：**
- `title`: 卡片标题
- `extra`: 右上角额外内容
- `className`: 自定义样式类（gradient, bordered, shadow-lg等）
- `customStyle`: 自定义内联样式
- `hasFooter`: 是否显示底部区域

### 2. 按钮组件 (ui-button)

多样式按钮组件，支持不同尺寸、类型和状态。

```xml
<!-- 基础按钮 -->
<ui-button text="主要按钮" bind:tap="onButtonTap"></ui-button>

<!-- 不同类型 -->
<ui-button type="secondary" text="次要按钮"></ui-button>
<ui-button type="outline" text="边框按钮"></ui-button>
<ui-button type="text" text="文字按钮"></ui-button>
<ui-button type="danger" text="危险按钮"></ui-button>

<!-- 不同尺寸 -->
<ui-button size="small" text="小按钮"></ui-button>
<ui-button size="large" text="大按钮"></ui-button>

<!-- 带图标 -->
<ui-button icon="camera" text="拍照"></ui-button>

<!-- 加载状态 -->
<ui-button loading="{{true}}" text="提交中"></ui-button>

<!-- 禁用状态 -->
<ui-button disabled="{{true}}" text="已禁用"></ui-button>
```

**属性说明：**
- `type`: 按钮类型（primary, secondary, outline, text, danger）
- `size`: 按钮尺寸（small, medium, large）
- `text`: 按钮文字
- `icon`: 图标名称或图片路径
- `loading`: 是否加载中
- `disabled`: 是否禁用
- `openType`: 微信开放能力

### 3. 占位图片组件 (placeholder-image)

智能图片组件，支持加载失败时显示占位内容。

```xml
<!-- 基础用法 -->
<placeholder-image src="{{imageUrl}}"></placeholder-image>

<!-- 自定义占位内容 -->
<placeholder-image 
  src="{{imageUrl}}" 
  type="green" 
  icon="camera" 
  text="暂无图片">
</placeholder-image>

<!-- 不同尺寸 -->
<placeholder-image className="small" src="{{imageUrl}}"></placeholder-image>
<placeholder-image className="avatar" src="{{userAvatar}}"></placeholder-image>
```

**属性说明：**
- `src`: 图片地址
- `mode`: 图片模式（同wx:image）
- `type`: 占位样式（gray, green, blue, pattern）
- `icon`: 占位图标
- `text`: 占位文字
- `className`: 样式类（small, medium, large, square, avatar）

## 🎨 开源资源推荐

### 图标库
1. **阿里巴巴矢量图标库** - https://www.iconfont.cn/
2. **Tabler Icons** - https://tabler-icons.io/
3. **Feather Icons** - https://feathericons.com/
4. **Heroicons** - https://heroicons.com/

### 图片库
1. **Unsplash** - https://unsplash.com/
2. **Pixabay** - https://pixabay.com/
3. **Pexels** - https://www.pexels.com/

### 设计规范
1. **微信设计指南** - https://developers.weixin.qq.com/miniprogram/design/
2. **WeUI** - https://weui.io/
3. **Ant Design Mobile** - https://mobile.ant.design/zh

## 🛠️ 工具类样式

项目包含完整的工具类样式系统，类似Tailwind CSS：

### 布局
```xml
<view class="flex items-center justify-between">
  <text>左侧内容</text>
  <text>右侧内容</text>
</view>
```

### 间距
```xml
<view class="p-4 mt-2 mb-3">带边距的容器</view>
```

### 文字
```xml
<text class="text-lg font-bold text-primary">大号粗体主色文字</text>
```

### 背景和圆角
```xml
<view class="bg-white rounded-lg shadow-md">带阴影的白色圆角容器</view>
```

## 📱 使用示例

在页面中使用这些组件：

```xml
<!-- 使用卡片和按钮组合 -->
<ui-card title="我的积分" extra="{{totalPoints}}">
  <view class="flex justify-between items-center">
    <text class="text-lg">可用积分</text>
    <text class="text-2xl font-bold text-primary">{{availablePoints}}</text>
  </view>
  <view slot="footer">
    <ui-button 
      type="outline" 
      text="查看明细" 
      className="w-full"
      bind:tap="viewDetails">
    </ui-button>
  </view>
</ui-card>

<!-- 商品列表 -->
<ui-card wx:for="{{products}}" wx:key="id">
  <view class="flex">
    <placeholder-image 
      className="square mr-3" 
      src="{{item.image}}"
      type="green">
    </placeholder-image>
    <view class="flex-1">
      <text class="text-lg font-medium">{{item.name}}</text>
      <text class="text-sm text-secondary mt-1">{{item.description}}</text>
      <view class="flex justify-between items-center mt-2">
        <text class="text-primary font-bold">{{item.points}}积分</text>
        <ui-button 
          size="small" 
          text="兑换" 
          data-id="{{item.id}}"
          bind:tap="onRedeem">
        </ui-button>
      </view>
    </view>
  </view>
</ui-card>
```

## 🔧 自定义主题

可以通过CSS变量自定义主题色彩：

```css
/* 在app.wxss中修改 */
page {
  --primary-color: #your-color;
  --primary-dark: #your-dark-color;
  /* 其他变量... */
}
```

这套组件库遵循现代化设计原则，提供了灵活的自定义选项，可以快速构建美观、一致的小程序界面。 