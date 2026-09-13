// 文章页增强:阅读进度条 / 目录导航 / 代码块复制 / 返回顶部 / 系列与上下篇导航
(function () {
    'use strict';

    function el(tag, cls, html) {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }

    function slugify(text, used) {
        let base = text.trim()
            .replace(/[《》()（）:：,，。.?？!！、\/\\\[\]]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'section';
        let s = base, i = 2;
        while (used[s]) { s = base + '-' + (i++); }
        used[s] = true;
        return s;
    }

    // ---------- 1. 阅读进度条 ----------
    function setupProgress() {
        const bar = el('div', 'read-progress');
        const fill = el('span', 'read-progress-fill');
        bar.appendChild(fill);
        document.body.appendChild(bar);

        const update = () => {
            const h = document.documentElement;
            const max = h.scrollHeight - h.clientHeight;
            const pct = max > 0 ? (h.scrollTop || document.body.scrollTop) / max * 100 : 0;
            fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
        };
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    // ---------- 2. 目录导航 ----------
    function setupTOC() {
        const body = document.querySelector('.article-body');
        if (!body) return;

        const heads = Array.from(body.querySelectorAll('h2, h3'));
        if (heads.length < 3) return;

        const used = {};
        const items = heads.map(h => {
            const id = slugify(h.textContent, used);
            h.id = id;
            return { id, level: h.tagName.toLowerCase(), text: h.textContent.trim() };
        });

        const toc = el('aside', 'toc');
        toc.id = 'toc';
        const title = el('div', 'toc-title', '// 目录');
        const list = el('ul', 'toc-list');
        items.forEach(it => {
            const li = el('li', 'toc-item toc-' + it.level);
            const a = el('a', 'toc-link', it.text);
            a.href = '#' + it.id;
            a.dataset.target = it.id;
            li.appendChild(a);
            list.appendChild(li);
        });
        toc.appendChild(title);
        toc.appendChild(list);
        document.body.appendChild(toc);

        // 移动端/窄屏:浮动按钮唤出目录
        const fab = el('button', 'toc-fab', '目录');
        fab.type = 'button';
        fab.addEventListener('click', () => toc.classList.toggle('open'));
        document.body.appendChild(fab);

        list.addEventListener('click', (e) => {
            if (e.target.closest('.toc-link') && window.innerWidth <= 1300) {
                toc.classList.remove('open');
            }
        });

        // 滚动高亮当前章节
        const links = Array.from(list.querySelectorAll('.toc-link'));
        const spy = () => {
            let activeIdx = 0;
            heads.forEach((h, i) => {
                if (h.getBoundingClientRect().top <= 140) activeIdx = i;
            });
            links.forEach((l, i) => l.classList.toggle('active', i === activeIdx));
        };
        window.addEventListener('scroll', spy, { passive: true });
        spy();
    }

    // ---------- 3. 代码块一键复制 ----------
    function setupCopyButtons() {
        document.querySelectorAll('.code-block').forEach(block => {
            const code = block.querySelector('code');
            if (!code) return;
            const btn = el('button', 'copy-btn', '复制');
            btn.type = 'button';
            btn.addEventListener('click', () => {
                const text = code.innerText;
                const done = () => {
                    btn.textContent = '已复制';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = '复制';
                        btn.classList.remove('copied');
                    }, 1600);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
                } else {
                    fallbackCopy(text, done);
                }
            });
            block.appendChild(btn);
        });
    }

    function fallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
    }

    // ---------- 4. 返回顶部 ----------
    function setupBackToTop() {
        const btn = el('button', 'top-fab', '↑');
        btn.type = 'button';
        btn.title = '返回顶部';
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.body.appendChild(btn);

        const toggle = () => btn.classList.toggle('show', window.scrollY > 600);
        window.addEventListener('scroll', toggle, { passive: true });
        toggle();
    }

    // ---------- 5. 系列导航 + 上一篇/下一篇 ----------
    function setupArticleNav() {
        const holder = document.getElementById('articleNav');
        const all = window.ALL_POSTS || [];
        if (!holder || !all.length) return;

        const idx = all.findIndex(p => location.pathname.endsWith(p.url.split('/').pop()));
        if (idx === -1) return;

        const cur = all[idx];
        const nav = el('div', 'article-nav');

        // 同系列
        const mates = all.filter(p => p.collection && p.collection === cur.collection && p.url !== cur.url);
        if (mates.length) {
            const box = el('div', 'nav-block');
            box.appendChild(el('div', 'nav-label', '// 同一系列:' + cur.collection));
            const ul = el('ul', 'nav-list');
            mates.forEach(p => {
                const li = el('li');
                const a = el('a', 'nav-link', '<span class="nav-emoji">' + (p.emoji || '·') + '</span> ' + p.title);
                a.href = '../' + p.url;
                li.appendChild(a);
                ul.appendChild(li);
            });
            box.appendChild(ul);
            nav.appendChild(box);
        }

        // 上一篇 / 下一篇(列表顺序:新 → 旧)
        const prev = all[idx - 1];
        const next = all[idx + 1];
        if (prev || next) {
            const row = el('div', 'nav-prev-next');
            if (prev) {
                const a = el('a', 'nav-arrow prev', '<span class="nav-tag">← 上一篇</span><span class="nav-text">' + prev.title + '</span>');
                a.href = '../' + prev.url;
                row.appendChild(a);
            } else {
                row.appendChild(el('span', 'nav-arrow disabled', '<span class="nav-tag">← 已是最新</span>'));
            }
            if (next) {
                const a = el('a', 'nav-arrow next', '<span class="nav-tag">下一篇 →</span><span class="nav-text">' + next.title + '</span>');
                a.href = '../' + next.url;
                row.appendChild(a);
            } else {
                row.appendChild(el('span', 'nav-arrow disabled', '<span class="nav-tag">已是最早 →</span>'));
            }
            nav.appendChild(row);
        }

        holder.appendChild(nav);
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupProgress();
        setupTOC();
        setupCopyButtons();
        setupBackToTop();
        setupArticleNav();
    });
})();
