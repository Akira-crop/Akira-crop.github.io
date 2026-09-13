// 笔记数据:由 tools/convert.js 生成的 assets/js/posts-data.js 提供
// 新增笔记 -> 改 tools/convert.js 的 posts 数组 -> 重新运行 node tools/convert.js
const blogPosts = (window.ALL_POSTS || [])
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

// 筛选状态:分类 + 系列 + 搜索词联合过滤
const filterState = {
    category: "全部",
    collection: "全部系列",
    query: ""
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    applyFilters();
    renderStats();
    renderTags();
    renderSeriesFilters();
    setupSearch();
    setupCategoryFilters();
    setupNavigation();
    setupMobileMenu();
});

// 联合筛选并渲染
function applyFilters() {
    const filtered = blogPosts.filter(post => {
        const matchCategory = filterState.category === "全部" || post.category === filterState.category;
        const matchSeries = filterState.collection === "全部系列" || post.collection === filterState.collection;
        const q = filterState.query;
        const matchQuery = !q ||
            post.title.toLowerCase().includes(q) ||
            (post.excerpt || '').toLowerCase().includes(q) ||
            post.tags.some(tag => tag.toLowerCase().includes(q));
        return matchCategory && matchSeries && matchQuery;
    });
    renderPosts(filtered);
    updateResultCount(filtered.length);
}

// 渲染笔记卡片
function renderPosts(posts) {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;

    if (posts.length === 0) {
        postsGrid.innerHTML = '<div class="no-posts">// 暂无匹配的笔记</div>';
        return;
    }

    postsGrid.innerHTML = posts.map(post => `
        <div class="post-card" onclick="viewPost('${post.slug}')">
            <div class="post-image">
                <span class="post-category">${post.category}</span>
                ${post.emoji || '📄'}
            </div>
            <div class="post-content">
                <div class="post-meta-line">
                    <span class="post-date">${formatDate(post.date)}</span>
                    <span class="post-collection">${post.collection || ''}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt || ''}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 结果计数
function updateResultCount(n) {
    const box = document.getElementById('resultCount');
    if (!box) return;
    const parts = [];
    if (filterState.category !== "全部") parts.push(filterState.category);
    if (filterState.collection !== "全部系列") parts.push(filterState.collection);
    if (filterState.query) parts.push('"' + filterState.query + '"');
    box.textContent = parts.length
        ? `// ${parts.join(' · ')} —— 匹配 ${n} 篇`
        : `// 共 ${n} 篇笔记`;
}

// 首页统计
function renderStats() {
    const box = document.getElementById('heroStats');
    if (!box) return;
    const categories = new Set(blogPosts.map(p => p.category));
    const collections = new Set(blogPosts.map(p => p.collection).filter(Boolean));
    const latest = blogPosts.reduce((a, p) => (a > p.date ? a : p.date), '');
    box.innerHTML = `
        <div class="stat"><span class="stat-num">${blogPosts.length}</span><span class="stat-label">篇笔记</span></div>
        <div class="stat"><span class="stat-num">${collections.size}</span><span class="stat-label">个系列</span></div>
        <div class="stat"><span class="stat-num">${categories.size}</span><span class="stat-label">个分类</span></div>
        <div class="stat"><span class="stat-num">${latest || '--'}</span><span class="stat-label">最近更新</span></div>
    `;
}

// 渲染系列筛选
function renderSeriesFilters() {
    const box = document.getElementById('seriesFilters');
    if (!box) return;
    const names = Array.from(new Set(blogPosts.map(p => p.collection).filter(Boolean)));
    if (names.length < 2) return;
    box.innerHTML = ['全部系列'].concat(names)
        .map(name => `<button class="series-btn${name === '全部系列' ? ' active' : ''}" data-series="${name}">${name}</button>`)
        .join('');

    box.querySelectorAll('.series-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            box.querySelectorAll('.series-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterState.collection = btn.dataset.series;
            applyFilters();
        });
    });
}

// 渲染标签云
function renderTags() {
    const allTags = new Set();
    blogPosts.forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });

    const tagsCloud = document.getElementById('tagsCloud');
    if (!tagsCloud) return;
    tagsCloud.innerHTML = Array.from(allTags).map(tag => `
        <div class="tag-cloud-item" onclick="filterByTag('${tag}')">${tag}</div>
    `).join('');
}

// 搜索
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        filterState.query = e.target.value.toLowerCase().trim();
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
    filterState.collection = "全部系列";
    document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.category === "全部");
    });
    document.querySelectorAll('.series-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.series === "全部系列");
    });
    filterState.query = tag.toLowerCase();
    document.getElementById('searchInput').value = tag;
    applyFilters();
    document.getElementById('posts').scrollIntoView({ behavior: 'smooth' });
}

// 查看笔记:跳转到详情页
function viewPost(slug) {
    const post = blogPosts.find(p => p.slug === slug);
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
