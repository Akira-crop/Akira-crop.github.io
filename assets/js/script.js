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
    setupTheme();
    setupNavScroll();
    applyFilters();
    renderStats();
    renderSeriesOverview();
    renderTags();
    renderSeriesFilters();
    setupSearch();
    setupCategoryFilters();
    setupNavigation();
    setupMobileMenu();
    setupReveal();
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

// 渲染文章列表
function renderPosts(posts) {
    const list = document.getElementById('postList');
    if (!list) return;

    if (posts.length === 0) {
        list.innerHTML = '<li class="no-posts">没有匹配的笔记,换个关键词试试。</li>';
        return;
    }

    list.innerHTML = posts.map(post => `
        <li class="post-item" data-category="${post.category}">
            <div class="item-slot" aria-hidden="true">${post.emoji || '📄'}</div>
            <div class="post-item-main">
                <div class="post-item-meta">
                    <span>${formatDate(post.date)}</span>
                    <span class="cat">${post.category}</span>
                    ${post.minutes ? `<span>约 ${post.minutes} 分钟</span>` : ''}
                </div>
                <h2 class="post-item-title">
                    <a href="${post.url}">${post.title}</a>
                </h2>
                <p class="post-item-excerpt">${post.excerpt || ''}</p>
                <div class="post-item-foot">
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
                    </div>
                    <a class="read-more" href="${post.url}">阅读全文 →</a>
                </div>
            </div>
        </li>
    `).join('');

    // 条目逐个渐显
    Array.from(list.children).forEach((item, i) => {
        item.dataset.reveal = '';
        item.style.transitionDelay = Math.min(i * 60, 360) + 'ms';
    });
    observeReveal(list);
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

// 顶部统计(一行小字)
function renderStats() {
    const box = document.getElementById('heroStats');
    if (!box) return;
    const collections = new Set(blogPosts.map(p => p.collection).filter(Boolean));
    const latest = blogPosts.reduce((a, p) => (a > p.date ? a : p.date), '');
    box.innerHTML = [
        `${blogPosts.length} 篇笔记`,
        `${collections.size} 个系列`,
        `最近更新 ${latest || '--'}`
    ].join('<span class="dot"> · </span>');
}

// 侧栏:系列归档
function renderSeriesOverview() {
    const box = document.getElementById('seriesOverview');
    if (!box) return;

    const groups = [];
    blogPosts.forEach(post => {
        const name = post.collection || '未归类';
        let g = groups.find(x => x.name === name);
        if (!g) { g = { name, posts: [] }; groups.push(g); }
        g.posts.push(post);
    });

    box.innerHTML = groups.map(g => `
        <div class="series-group">
            <div class="series-name">
                <span>${g.name}</span>
                <span class="series-count">${g.posts.length} 篇</span>
            </div>
            <ul class="series-posts">
                ${g.posts.map(p => `<li><a href="${p.url}">${p.title}</a></li>`).join('')}
            </ul>
        </div>
    `).join('');
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
    const sections = document.querySelectorAll('section[data-nav]');

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

// ===== 交互:主题切换 / 导航状态 / 滚动渐显 =====

// 深浅色切换(持久化到 localStorage)
function setupTheme() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const meta = document.querySelector('meta[name="theme-color"]');
    const sync = () => {
        if (meta) meta.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#000000' : '#fbfbfd');
    };
    sync();

    btn.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch (e) {}
        sync();
    });
}

// 滚动时导航栏收窄
function setupNavScroll() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const update = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', update, { passive: true });
    update();
}

// 滚动渐显(观察器懒加载,保证动态渲染的卡片也能被观察到)
let revealObserver = null;

function getRevealObserver() {
    if (revealObserver) return revealObserver;
    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    return revealObserver;
}

function setupReveal() {
    observeReveal(document);
}

function observeReveal(root) {
    const io = getRevealObserver();
    root.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => io.observe(el));
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
