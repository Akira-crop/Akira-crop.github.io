// 简单的 Markdown -> 博客文章页转换器(针对本博客笔记的语法子集)
// 用法: node tools/convert.js
const fs = require('fs');
const path = require('path');
const katex = require('./vendor/katex-0.16.39.js');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 构建时生成原生 MathML，文章页无需加载数学渲染脚本或外部字体。
function renderMath(source, displayMode = false) {
    return katex.renderToString(source, {
        output: 'mathml',
        displayMode,
        throwOnError: true,
        strict: 'ignore',
        trust: false
    });
}

// 行内语法: 行内代码、加粗、链接、$...$ 数学
function inline(s, math = false) {
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (_, c) => {
        codes.push(c);
        return '' + (codes.length - 1) + '';
    });
    const formulas = [];
    if (math) {
        s = s.replace(/\$([^$]+)\$/g, (_, source) => {
            formulas.push(renderMath(source));
            return '\u0002' + (formulas.length - 1) + '\u0002';
        });
    }
    s = escapeHtml(s);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>');
    if (!math) {
        // 保留已有文章的简单数学格式: $-2^{31}$ -> -2<sup>31</sup>
        s = s.replace(/\$([^$]+)\$/g, (_, m) => {
            return '<span class="math">' + m.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>') + '</span>';
        });
    }
    s = s.replace(/\u0002(\d+)\u0002/g, (_, i) => formulas[+i]);
    s = s.replace(/(\d+)/g, (_, i) => '<code>' + escapeHtml(codes[+i]) + '</code>');
    return s;
}

function convert(md, { math = false } = {}) {
    const renderInline = s => inline(s, math);
    const lines = md.split(/\r?\n/);
    let html = '';
    let i = 0;
    let inCode = false, codeLang = '', codeBuf = [];
    let listType = null; // 'ul' | 'ol'
    let inQuote = false, quoteBuf = [];

    const closeList = () => {
        if (listType) { html += `</${listType}>\n`; listType = null; }
    };
    const closeQuote = () => {
        if (inQuote) {
            html += '<blockquote>' + quoteBuf.map(renderInline).join('<br>') + '</blockquote>\n';
            inQuote = false; quoteBuf = [];
        }
    };

    while (i < lines.length) {
        const line = lines[i];

        // 代码块
        if (/^```/.test(line)) {
            if (!inCode) {
                closeList(); closeQuote();
                inCode = true;
                codeLang = line.slice(3).trim();
                codeBuf = [];
            } else {
                html += `<pre class="code-block"><div class="code-lang">${codeLang || 'code'}</div><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>\n`;
                inCode = false;
            }
            i++;
            continue;
        }
        if (inCode) { codeBuf.push(line); i++; continue; }

        // 独立行的 $$...$$ 公式块，仅在文章启用 math 时解析。
        if (math && line.trim() === '$$') {
            closeList(); closeQuote();
            const startLine = i + 1;
            const formula = [];
            i++;
            while (i < lines.length && lines[i].trim() !== '$$') {
                formula.push(lines[i++]);
            }
            if (i === lines.length) throw new Error('未闭合的数学公式块，起始行: ' + startLine);
            html += '<div class="math-display">' + renderMath(formula.join('\n'), true) + '</div>\n';
            i++;
            continue;
        }

        // 空行
        if (/^\s*$/.test(line)) { closeList(); closeQuote(); i++; continue; }

        // 表格
        if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|/.test(lines[i + 1])) {
            closeList(); closeQuote();
            const headerCells = line.split('|').slice(1, -1).map(c => c.trim());
            const aligns = lines[i + 1].split('|').slice(1, -1).map(c => {
                const t = c.trim();
                if (t.startsWith(':') && t.endsWith(':')) return 'center';
                if (t.endsWith(':')) return 'right';
                return 'left';
            });
            i += 2;
            let rows = [];
            while (i < lines.length && /^\|/.test(lines[i])) {
                rows.push(lines[i].split('|').slice(1, -1).map(c => c.trim()));
                i++;
            }
            html += '<div class="table-wrap"><table><thead><tr>' +
                headerCells.map((c, k) => `<th style="text-align:${aligns[k] || 'left'}">${renderInline(c)}</th>`).join('') +
                '</tr></thead><tbody>' +
                rows.map(r => '<tr>' + r.map((c, k) => `<td style="text-align:${aligns[k] || 'left'}">${renderInline(c)}</td>`).join('') + '</tr>').join('') +
                '</tbody></table></div>\n';
            continue;
        }

        // 标题
        const h = line.match(/^(#{1,4})\s+(.*)$/);
        if (h) {
            closeList(); closeQuote();
            const level = h[1].length;
            if (level === 1) { i++; continue; } // 文章 H1 由模板渲染
            html += `<h${level}>${renderInline(h[2])}</h${level}>\n`;
            i++;
            continue;
        }

        // 分割线
        if (/^---+\s*$/.test(line)) { closeList(); closeQuote(); html += '<hr>\n'; i++; continue; }

        // 引用块
        if (/^>\s?/.test(line)) {
            closeList();
            inQuote = true;
            quoteBuf.push(line.replace(/^>\s?/, ''));
            i++;
            continue;
        }
        closeQuote();

        // 列表
        const ul = line.match(/^[-*]\s+(.*)$/);
        const ol = line.match(/^\d+\.\s+(.*)$/);
        if (ul) {
            if (listType !== 'ul') { closeList(); html += '<ul>\n'; listType = 'ul'; }
            html += `<li>${renderInline(ul[1])}</li>\n`;
            i++;
            continue;
        }
        if (ol) {
            if (listType !== 'ol') { closeList(); html += '<ol>\n'; listType = 'ol'; }
            html += `<li>${renderInline(ol[1])}</li>\n`;
            i++;
            continue;
        }
        closeList();

        // 普通段落
        html += `<p>${renderInline(line)}</p>\n`;
        i++;
    }
    closeList(); closeQuote();
    return html;
}

function pageTemplate({ title, date, tags, series, body, math = false }) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${title}">
    <meta name="theme-color" content="#f6f2ea">
    <title>${title} - Akira's Notes</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="icon" href="../assets/images/favicon.png">
    <script>
        (function () {
            try {
                var t = localStorage.getItem('theme');
                if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.dataset.theme = t;
            } catch (e) {}
        })();
    </script>
</head>
<body>
    <nav class="navbar" id="navbar">
        <div class="container">
            <div class="logo">
                <a href="../index.html">Akira's Notes<span class="logo-sub">学习笔记库</span></a>
            </div>
            <ul class="nav-menu">
                <li><a href="../index.html#home">首页</a></li>
                <li><a href="../index.html#posts" class="active">笔记</a></li>
                <li><a href="../index.html#series">系列</a></li>
                <li><a href="../index.html#about">关于</a></li>
            </ul>
            <button class="theme-toggle" id="themeToggle" type="button" title="切换白天 / 夜晚">
                <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
                </svg>
                <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>
                </svg>
            </button>
            <div class="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <article class="article-page">
        <div class="article-container">
            <a href="../index.html#posts" class="back-link">&lt; 返回笔记列表</a>
            <header class="article-header">
                <div class="article-series">${series}</div>
                <h1>${title}</h1>
                <div class="article-meta">
                    <span class="post-date">${date}</span>
                    <div class="post-tags">
                        ${tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}
                    </div>
                </div>
            </header>
            <div class="article-body${math ? ' article-body-math' : ''}">
${body}
            </div>
            <footer class="article-footer">
                <div id="articleNav"></div>
                <a href="../index.html#posts" class="back-link">&lt; 返回笔记列表</a>
            </footer>
        </div>
    </article>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 Akira's Notes // Keep learning, keep noting.</p>
        </div>
    </footer>

    <script src="../assets/js/posts-data.js"></script>
    <script>
        (function () {
            var b = document.getElementById('themeToggle');
            var meta = document.querySelector('meta[name="theme-color"]');
            if (b) b.addEventListener('click', function () {
                var n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
                document.documentElement.dataset.theme = n;
                if (meta) meta.setAttribute('content', n === 'dark' ? '#000000' : '#f6f2ea');
                try { localStorage.setItem('theme', n); } catch (e) {}
            });
        })();
    </script>
    <script src="../assets/js/article.js"></script>
</body>
</html>`;
}

const posts = [
    {
        src: path.join(ROOT, 'notes/learning-in-llm-age-zh.md'),
        out: 'learning-in-llm-age-zh.html',
        title: 'LLM 时代，如何继续学习：把 AI 当导师，而不是答案机器（译）',
        date: '2026年10月7日',
        dateISO: '2026-10-07',
        category: '专题笔记',
        collection: 'LLM 时代的学习方法',
        emoji: '🧠',
        excerpt: 'Oğuzhan Olguncu 谈如何在 LLM 时代继续学习：让 AI 提问而不是代写，提前拆解项目，让进展可见，并用短时段、持续的练习保留真正理解。',
        tags: ['LLM', '学习方法', '编程学习', 'AI工具', '翻译'],
        series: 'LLM 时代的学习方法 · 译文'
    },
    {
        src: path.join(ROOT, 'notes/probability-paradoxes.md'),
        out: 'probability-paradoxes.html',
        title: '概率论学习笔记：12 个经典问题与建模误区',
        date: '2026年10月7日',
        dateISO: '2026-10-07',
        category: '专题笔记',
        collection: '概率论学习笔记',
        emoji: '🎲',
        excerpt: '从蒙提霍尔到圣彼得堡，按条件信息、组合与抽样、独立性、分组与期望整理 12 个经典问题，补齐答案成立的前提、计算过程和复习检查清单。',
        tags: ['概率论', '条件概率', '统计学', '学习笔记'],
        series: '概率论学习笔记 · 经典问题与建模误区',
        math: true
    },
    {
        src: 'F:/学习笔记/《置身事内》学习笔记/2026-09-09_知乎版.md',
        out: 'zhishenshinei-1.html',
        title: '《置身事内》读书笔记(一):中国政府这台机器是怎么组织起来的',
        date: '2026年9月9日',
        dateISO: '2026-09-09',
        category: '读书笔记',
        collection: '《置身事内》读书笔记',
        emoji: '🏛️',
        excerpt: '五级架构、央地关系、条块分割——第一章的两张图纸。判断任何一级政府的真实权力,只需问:人事权和财政权在谁手里。',
        tags: ['置身事内', '经济学', '中国政府', '读书笔记'],
        series: '《置身事内》读书笔记 · 第一章'
    },
    {
        src: 'F:/学习笔记/cs61b/CS61B_Lecture_3_知乎版.md',
        out: 'cs61b-lecture-3.html',
        title: 'CS61B Lecture 3 笔记:List/Array/Map 只是铺垫,引用模型才是这一讲的本体',
        date: '2026年9月8日',
        dateISO: '2026-09-08',
        category: '课程笔记',
        collection: 'CS61B 自学笔记',
        emoji: '🦭',
        excerpt: '为什么 b = a 之后改 b 会影响 a?Java 到底是传值还是传引用?二维数组为什么可以每行长度不同?全部从一条 Golden Rule of Equals 推出来。',
        tags: ['CS61B', 'Java', '引用', '数据结构', '学习笔记'],
        series: 'CS61B 自学笔记 · Lecture 3'
    },
    {
        src: 'F:/学习笔记/cs61b/CS61B_Lecture_1_知乎版.md',
        out: 'cs61b-lecture-1.html',
        title: 'CS61B Lecture 1 笔记:从已有语言迁移到 Java,真正该建立的是哪几个模型',
        date: '2026年9月7日',
        dateISO: '2026-09-07',
        category: '课程笔记',
        collection: 'CS61B 自学笔记',
        emoji: '☕',
        excerpt: 'HelloWorld、编译运行、静态类型……单拆出来都简单,但这一讲的本质是建立三个模型:程序的结构模型、编译运行模型、静态类型模型。',
        tags: ['CS61B', 'Java', '学习笔记'],
        series: 'CS61B 自学笔记 · Lecture 1'
    },
    {
        src: 'F:/学习笔记/cs61b/CS61B_Lecture_2_知乎版.md',
        out: 'cs61b-lecture-2.html',
        title: 'CS61B Lecture 2 笔记:类与对象,以及贯穿全讲的一对判断——数据属于谁,行为由谁执行',
        date: '2026年9月7日',
        dateISO: '2026-09-07',
        category: '课程笔记',
        collection: 'CS61B 自学笔记',
        emoji: '🐶',
        excerpt: '构造器、this、实例方法 vs 静态方法、实例变量 vs 静态变量……这一讲的语法点全部围绕一对判断展开,最后落到接口与实现的分离。',
        tags: ['CS61B', 'Java', '面向对象', '学习笔记'],
        series: 'CS61B 自学笔记 · Lecture 2'
    }
];

if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

for (const p of posts) {
    const md = fs.readFileSync(p.src, 'utf-8');
    const body = convert(md, p);
    // 粗略估算阅读时长:去空白后的字符数 / 380
    p.minutes = Math.max(1, Math.round(md.replace(/\s/g, '').length / 380));
    fs.writeFileSync(path.join(POSTS_DIR, p.out), pageTemplate({ ...p, body }), 'utf-8');
    console.log('generated:', p.out, '(' + body.length + ' chars, ~' + p.minutes + ' min)');
}

// 生成全站文章索引(首页与文章页共用同一份数据,新增笔记只需改上面的 posts)
const index = posts.map(p => ({
    slug: p.out.replace(/\.html$/, ''),
    title: p.title,
    date: p.dateISO,
    category: p.category,
    collection: p.collection,
    series: p.series,
    tags: p.tags,
    emoji: p.emoji,
    excerpt: p.excerpt,
    minutes: p.minutes,
    url: 'posts/' + p.out
}));
fs.writeFileSync(
    path.join(ROOT, 'assets/js/posts-data.js'),
    '// 由 tools/convert.js 自动生成,请勿手动编辑\nwindow.ALL_POSTS = ' + JSON.stringify(index, null, 4) + ';\n',
    'utf-8'
);
console.log('generated: assets/js/posts-data.js (' + index.length + ' posts)');
