// 文章数据
const blogPosts = [
    {
        id: 2,
        title: "CS61B Lecture 2 笔记:类与对象,以及贯穿全讲的一对判断——数据属于谁,行为由谁执行",
        excerpt: "构造器、this、实例方法 vs 静态方法、实例变量 vs 静态变量……这一讲的语法点全部围绕一对判断展开,最后落到接口与实现的分离。",
        date: "2026-09-07",
        tags: ["CS61B", "Java", "面向对象", "学习笔记"],
        emoji: "🐶",
        url: "posts/cs61b-lecture-2.html"
    },
    {
        id: 1,
        title: "CS61B Lecture 1 笔记:从已有语言迁移到 Java,真正该建立的是哪几个模型",
        excerpt: "HelloWorld、编译运行、静态类型……单拆出来都简单,但这一讲的本质是建立三个模型:程序的结构模型、编译运行模型、静态类型模型。",
        date: "2026-09-07",
        tags: ["CS61B", "Java", "学习笔记"],
        emoji: "☕",
        url: "posts/cs61b-lecture-1.html"
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

// 查看文章：跳转到文章详情页
function viewPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (post && post.url) {
        window.location.href = post.url;
    }
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