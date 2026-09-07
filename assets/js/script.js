// 示例数据 - 你可以替换为实际的文章数据
const blogPosts = [
    {
        id: 1,
        title: "JavaScript 高级技巧",
        excerpt: "深入探讨 JavaScript 的闭包、原型链和异步编程等高级概念...",
        date: "2024-01-15",
        tags: ["JavaScript", "编程"],
        emoji: "💻"
    },
    {
        id: 2,
        title: "如何构建响应式网站",
        excerpt: "学习使用 CSS Grid 和 Flexbox 创建现代化的响应式设计...",
        date: "2024-01-10",
        tags: ["CSS", "Web设计"],
        emoji: "🎨"
    },
    {
        id: 3,
        title: "GitHub Pages 部署指南",
        excerpt: "一步步教你如何使用 GitHub Pages 免费托管你的网站...",
        date: "2024-01-05",
        tags: ["GitHub", "部署"],
        emoji: "🚀"
    },
    {
        id: 4,
        title: "React Hooks 完全指南",
        excerpt: "掌握 React Hooks，写出更简洁优雅的函数式组件...",
        date: "2023-12-28",
        tags: ["React", "编程"],
        emoji: "⚛️"
    },
    {
        id: 5,
        title: "前端性能优化秘诀",
        excerpt: "从加载、渲染到交互，全方位优化前端应用性能...",
        date: "2023-12-20",
        tags: ["性能", "前端"],
        emoji: "⚡"
    },
    {
        id: 6,
        title: "Web 安全最佳实践",
        excerpt: "了解常见的安全漏洞和如何防护你的 Web 应用...",
        date: "2023-12-15",
        tags: ["安全", "Web"],
        emoji: "🔒"
    }
];

// 初始化博客
document.addEventListener('DOMContentLoaded', () => {
    renderPosts(blogPosts);
    renderTags();
    setupSearch();
    setupContactForm();
    setupNavigation();
    setupMobileMenu();
});

// 渲染文章
function renderPosts(posts) {
    const postsGrid = document.getElementById('postsGrid');
    
    if (posts.length === 0) {
        postsGrid.innerHTML = '<div class="no-posts">暂无文章</div>';
        return;
    }

    postsGrid.innerHTML = posts.map(post => `
        <div class="post-card" onclick="viewPost(${post.id})">
            <div class="post-image">${post.emoji}</div>
            <div class="post-content">
                <div class="post-date">${formatDate(post.date)}</div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 渲染标签云
function renderTags() {
    const allTags = new Set();
    blogPosts.forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });

    const tagsCloud = document.getElementById('tagsCloud');
    tagsCloud.innerHTML = Array.from(allTags).map(tag => `
        <div class="tag-cloud-item" onclick="filterByTag('${tag}')">${tag}</div>
    `).join('');
}

// 搜索功能
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = blogPosts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
        );
        renderPosts(filtered);
    });
}

// 按标签过滤
function filterByTag(tag) {
    const filtered = blogPosts.filter(post => post.tags.includes(tag));
    renderPosts(filtered);
    document.getElementById('searchInput').value = '';
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
}

// 查看文章（示例：显示 alert，实际应该跳转到文章详情页）
function viewPost(id) {
    const post = blogPosts.find(p => p.id === id);
    alert(`您点击了文章: ${post.title}\n\n这是一个示例，实际应该跳转到文章详情页面。`);
    // 在真实项目中，可以这样跳转：
    // window.location.href = `/posts/${post.id}`;
}

// 日期格式化
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-CN', options);
}

// 联系表单
function setupContactForm() {
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formMessage = document.getElementById('formMessage');
        
        // 这里应该调用后端 API 发送邮件
        // 目前只是一个演示
        formMessage.textContent = '消息已发送！感谢您的留言。';
        formMessage.classList.add('success');
        
        setTimeout(() => {
            form.reset();
            formMessage.textContent = '';
            formMessage.classList.remove('success');
        }, 3000);
    });
}

// 导航栏链接活跃状态
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('section');

    const highlightNavLink = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', highlightNavLink);
    
    // 点击链接时的平滑滚动
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// 移动端菜单
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
}

// 添加一些有趣的交互效果
window.addEventListener('load', () => {
    // 页面加载完成后的动画
    document.body.style.animation = 'fadeIn 0.6s ease-in';
});

// 页面卸载时的过渡
window.addEventListener('beforeunload', () => {
    document.body.style.opacity = '0.8';
});