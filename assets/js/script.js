// 笔记数据
// category 可选值:课程笔记 / 论文笔记(新增分类时,在 index.html 的 category-filters 里加对应按钮即可)
const blogPosts = [
    {
        id: 2,
        title: "CS61B Lecture 2 笔记:类与对象,以及贯穿全讲的一对判断——数据属于谁,行为由谁执行",
        excerpt: "构造器、this、实例方法 vs 静态方法、实例变量 vs 静态变量……这一讲的语法点全部围绕一对判断展开,最后落到接口与实现的分离。",
        date: "2026-09-07",
        category: "课程笔记",
        tags: ["CS61B", "Java", "面向对象", "学习笔记"],
        emoji: "🐶",
        url: "posts/cs61b-lecture-2.html"
    },
    {
        id: 1,
        title: "CS61B Lecture 1 笔记:从已有语言迁移到 Java,真正该建立的是哪几个模型",
        excerpt: "HelloWorld、编译运行、静态类型……单拆出来都简单,但这一讲的本质是建立三个模型:程序的结构模型、编译运行模型、静态类型模型。",
        date: "2026-09-07",
        category: "课程笔记",
        tags: ["CS61B", "Java", "学习笔记"],
        emoji: "☕",
        url: "posts/cs61b-lecture-1.html"
    }
];

// 筛选状态:分类 + 搜索词联合过滤
const filterState = {
    category: "全部",
    query: ""
};

// 初始化博客
document.addEventListener('DOMContentLoaded', () => {
    applyFilters();
    renderTags();
    setupSearch();
    setupCategoryFilters();
    setupNavigation();
    setupMobileMenu();
});

// 联合筛选并渲染
function applyFilters() {
    const filtered = blogPosts.filter(post => {
        const matchCategory = filterState.category === "全部" || post.category === filterState.category;
        const q = filterState.query;
        const matchQuery = !q ||
            post.title.toLowerCase().includes(q) ||
            post.excerpt.toLowerCase().includes(q) ||
            post.tags.some(tag => tag.toLowerCase().includes(q));
        return matchCategory && matchQuery;
    });
    renderPosts(filtered);
}

// 渲染笔记卡片
function renderPosts(posts) {
    const postsGrid = document.getElementById('postsGrid');

    if (posts.length === 0) {
        postsGrid.innerHTML = '<div class="no-posts">// 暂无匹配的笔记</div>';
        return;
    }

    postsGrid.innerHTML = posts.map(post => `
        <div class="post-card" onclick="viewPost(${post.id})">
            <div class="post-image">
                <span class="post-category">${post.category}</span>
                ${post.emoji}
            </div>
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

// 搜索
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        filterState.query = e.target.value.toLowerCase();
        applyFilters();
    });
}

// 分类筛选按钮
function setupCategoryFilters() {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterState.category = btn.dataset.category;
            applyFilters();
        });
    });
}

// 供 hero 按钮调用:按分类跳转并过滤
function filterByCategory(category) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(b => {
        b.classList.toggle('active', b.dataset.category === category);
    });
    filterState.category = category;
    applyFilters();
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
}

// 按标签过滤
function filterByTag(tag) {
    filterState.category = "全部";
    document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.category === "全部");
    });
    filterState.query = tag.toLowerCase();
    document.getElementById('searchInput').value = tag;
    applyFilters();
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
}

// 查看笔记:跳转到详情页
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

// 导航栏链接活跃状态
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('section');

    const highlightNavLink = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
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

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
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
