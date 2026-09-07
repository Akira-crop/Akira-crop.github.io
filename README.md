# Akira's Blog 🌟

一个现代化的个人博客网站，基于纯 HTML、CSS 和 JavaScript 构建。

## ✨ 功能特性

- 📱 **响应式设计** - 完美适配桌面、平板和手机设备
- 🎨 **现代化界面** - 使用渐变色、阴影和动画创建视觉吸引力
- 📝 **文章管理** - 支持文章列表、标签分类和详情展示
- 🔍 **搜索功能** - 实时搜索文章标题、内容和标签
- 🏷️ **标签云** - 直观的标签云展示和过滤功能
- 💬 **联系表单** - 访客可以直接发送消息
- ⚡ **快速加载** - 无需任何打包工具或依赖，开箱即用
- 🎭 **动画效果** - 流畅的页面动画和交互体验

## 📁 文件结构

```
Akira-crop.github.io/
├── index.html              # 主页面
├── assets/
│   ├── css/
│   │   └── style.css       # 样式表
│   ├── js/
│   │   └── script.js       # 脚本文件
│   └── images/
│       └── favicon.ico     # 网站图标
└── README.md              # 项目说明
```

## 🚀 快速开始

1. **克隆或下载项目**
   ```bash
   git clone https://github.com/Akira-crop/Akira-crop.github.io.git
   cd Akira-crop.github.io
   ```

2. **本地预览**
   - 直接在浏览器中打开 `index.html`
   - 或使用 Python 简单 HTTP 服务器：
     ```bash
     python -m http.server 8000
     ```
   - 然后访问 `http://localhost:8000`

3. **自动部署**
   - 项目已上传到 GitHub
   - GitHub Pages 会自动部署到 `https://Akira-crop.github.io`

## 📝 自定义你的博客

### 1. 修改博客信息

编辑 `index.html` 中的以下部分：

- **网站标题和描述**（第 6-8 行）
- **导航菜单**（第 36-41 行）
- **关于我的信息**（第 103-108 行）
- **社交链接**（第 109-124 行）
- **联系方式**（第 130-135 行）

### 2. 添加文章

编辑 `assets/js/script.js` 中的 `blogPosts` 数组，添加你的文章：

```javascript
const blogPosts = [
    {
        id: 7,
        title: "你的文章标题",
        excerpt: "文章摘要...",
        date: "2024-01-20",
        tags: ["标签1", "标签2"],
        emoji: "📚"  // 使用你喜欢的 emoji
    },
    // ... 更多文章
];
```

### 3. 修改色彩主题

编辑 `assets/css/style.css` 中的 CSS 变量（第 7-17 行）：

```css
:root {
    --primary-color: #667eea;      /* 主色调 */
    --secondary-color: #764ba2;    /* 辅助色 */
    --text-color: #333;            /* 文字颜色 */
    /* ... 其他变量 */
}
```

### 4. 添加个人头像

替换 `.avatar-placeholder` 元素，或在 `assets/images/` 目录中添加你的头像图片。

### 5. 连接邮件功能

要使联系表单真正发送邮件，你可以：

- 使用 [Formspree](https://formspree.io/) 或 [EmailJS](https://www.emailjs.com/)
- 连接到你自己的后端 API
- 使用 GitHub Issues 作为留言存储

## 🎨 主题定制

### 修改字体

在 `style.css` 中，查找 `font-family` 属性并修改为你喜欢的字体。

### 调整布局

Grid 列数定义在 `.posts-grid` 中：
```css
.posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
```

修改 `minmax()` 值来改变卡片大小。

## 📱 响应式断点

- 📱 **移动设备**: 最大宽度 480px
- 📟 **平板**: 最大宽度 768px  
- 💻 **桌面**: 1200px 及以上

## 🔧 常见问题

**Q: 如何添加文章详情页？**
A: 创建新文件 `posts/article-1.html`，或使用 `post.html?id=1` 的方式。

**Q: 如何添加评论功能？**
A: 集成第三方服务如 Disqus、Valine 或 Utterances。

**Q: 如何优化 SEO？**
A: 使用合适的 meta 标签、结构化数据，并在 Google Search Console 中提交。

## 🚀 部署到 GitHub Pages

1. 确保文件已上传到 GitHub
2. 进入仓库设置 → Pages
3. 选择 `main` 分支作为源
4. 保存后，稍等片刻就能访问你的博客

## 📄 许可证

MIT License - 自由使用和修改

## 💡 建议和改进

欢迎通过 GitHub Issues 提出建议和 bug 报告！

---

**开心写博客！** 🎉

如果这个项目对你有帮助，请给个 Star ⭐！
