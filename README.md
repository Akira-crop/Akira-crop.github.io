# Akira's Notes

Akira 的个人学习笔记站点，使用原生 HTML、CSS 和 JavaScript 构建，部署在 GitHub Pages。这里记录课程学习、读书和对概念的整理，当前内容包括 CS61B 自学笔记，以及《置身事内》读书笔记。

站点地址：<https://akira-crop.github.io/>

## 站点功能

- 按更新时间展示笔记，并支持按标题、摘要和标签搜索。
- 支持按内容分类筛选：课程笔记、读书笔记和其他分类。
- 支持按系列筛选，并在侧栏查看系列归档。
- 根据文章自动生成标签云、文章数量和最近更新时间等信息。
- 文章页提供阅读进度条、阅读等级、目录导航、代码块复制、返回顶部和上一篇/下一篇导航。
- 支持明暗主题切换，主题偏好保存在浏览器的 `localStorage` 中。
- 使用响应式布局和像素风视觉素材，适配桌面端和移动端。
- 内置公众号排版工具：粘贴或导入 Markdown，实时预览多套主题，并复制为可直接粘贴到公众号编辑器的富文本。

## 当前内容

| 系列 | 内容 |
| --- | --- |
| CS61B 自学笔记 | Lecture 1–3，覆盖 Java 基础、类与对象、引用模型、数组和集合等主题 |
| 《置身事内》读书笔记 | 第一章，整理中国政府组织结构、央地关系与条块分割 |

文章索引统一保存在 `assets/js/posts-data.js`，首页和文章页共用这份数据。

## 项目结构

```text
.
├── index.html                 # 首页：笔记列表、搜索、筛选和侧栏
├── wechat.html                # 公众号 Markdown 排版工具
├── posts/                     # 独立文章页面
├── assets/
│   ├── css/style.css          # 全站样式与主题
│   ├── css/wechat.css         # 公众号工具工作区样式
│   ├── js/script.js           # 首页交互与筛选逻辑
│   ├── js/article.js          # 文章页增强功能
│   ├── js/wechat-tool.js      # Markdown 解析、预览和复制逻辑
│   ├── js/posts-data.js       # 自动生成的文章索引
│   └── images/                # 像素风纹理、头像和站点图标
└── tools/
    ├── convert.js             # Markdown 笔记转文章页并生成索引
    └── textures.py            # 生成像素风 PNG 素材
```

## 本地预览

项目是纯静态站点，不需要安装前端依赖。克隆后在项目根目录启动一个本地 HTTP 服务即可：

```bash
git clone https://github.com/Akira-crop/Akira-crop.github.io.git
cd Akira-crop.github.io
python -m http.server 8000
```

然后打开 <http://localhost:8000>。也可以直接打开 `index.html`，但使用 HTTP 服务更接近 GitHub Pages 的运行环境。

公众号排版工具位于 <http://localhost:8000/wechat.html>。

## 添加或更新文章

文章页面和索引由 `tools/convert.js` 生成。通常的流程是：

1. 准备 Markdown 笔记。
2. 在 `tools/convert.js` 的 `posts` 数组中配置源文件路径、标题、日期、分类、系列和标签。
3. 执行：

   ```bash
   node tools/convert.js
   ```

4. 检查生成的 `posts/*.html` 和 `assets/js/posts-data.js`，然后提交变更。

转换器支持本项目使用的 Markdown 子集，包括二级至四级标题、列表、引用、围栏代码块、表格、链接、行内代码、加粗和简单数学表达式。`assets/js/posts-data.js` 是生成文件，请不要直接手动编辑。

当前转换器中的 `src` 路径指向作者本机的 Markdown 文件目录。其他环境使用前需要把这些路径改成自己的笔记位置；如果只维护已经生成的文章页面，则不需要运行转换器。

## 公众号排版工具

打开 `wechat.html` 后，将 Markdown 粘贴到左侧输入区，右侧会实时生成公众号风格的文章预览。工具支持导入 `.md` 文件、自动保存浏览器草稿、摸鱼绿/红白/石墨极简/留白禅意/摸鱼票据/橄榄手记六套主题、标题层级、引用、列表、表格、代码块、图片和常用行内强调。正文从 Markdown 标题直接开始，不会额外插入封面卡片或横向目录。

点击「复制到公众号」会同时写入 `text/html` 和纯文本剪贴板内容，浏览器支持时可直接在微信公众号文章编辑器中粘贴并保留内联样式。也可以复制 HTML 源码或下载 HTML 文件；图片不会被上传，Markdown 中的图片地址需要使用公众号可以访问的 HTTPS 地址。

## 发布到 GitHub Pages

仓库已经适合直接作为 GitHub Pages 的静态源。发布时在仓库的 **Settings → Pages** 中选择 `main` 分支和根目录 `/`，保存后等待 GitHub Pages 完成部署即可。

本项目没有构建步骤、包管理文件或运行时后端；提交 HTML、CSS、JavaScript 和静态资源后即可发布。

## 维护提示

- 修改首页文案或导航时编辑 `index.html`。
- 修改主题、布局和响应式样式时编辑 `assets/css/style.css`。
- 修改首页搜索、筛选或统计逻辑时编辑 `assets/js/script.js`。
- 修改文章页目录、进度条、复制按钮或文章导航时编辑 `assets/js/article.js`。
- 新增或替换像素素材后，将文件放入 `assets/images/`，并在页面或样式中引用。
