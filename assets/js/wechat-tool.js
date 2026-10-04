/*
 * Markdown -> 微信公众号正文
 *
 * 这个工具不依赖构建工具或第三方运行时库：输入在浏览器本地解析，输出只使用
 * 微信编辑器容易保留的内联样式。生成的正文不会带入本页面的 class、id 或脚本。
 */
(function () {
    'use strict';

    const SAMPLE = `# 把复杂问题讲清楚

> 好的笔记不是把资料搬过来，而是把自己的理解留下来。

## 先搭一张地图

写文章之前，先把问题拆成几个可以回答的小问题。这样做的好处是，读者能看见推理路径，作者也不容易在细节里迷路。

**结构先行**，再把证据、例子和自己的判断放回对应的位置。

## 再补关键细节

公众号文章适合短段落、清晰的小标题和必要的强调。你可以使用 \`inline code\`，也可以把重要的词写成 ==黄色高亮==。

- 先写出结论，再补充理由
- 每段只保留一个重点
- 用真实例子帮助读者建立画面

### 一个小例子

\`\`\`javascript
const notes = ['问题', '证据', '判断'];
console.log(notes.join(' → '));
\`\`\`

## 写在最后

排版的目的，是让内容更容易被读完。主题、颜色和装饰都应该服务于阅读本身。`;

    const THEMES = {
        moyu: {
            name: '摸鱼绿',
            accent: '#059669',
            accent2: '#10B981',
            deep: '#111827',
            body: '#374151',
            muted: '#6B7280',
            faint: '#9CA3AF',
            border: '#D1D5DB',
            light: '#ECFDF5',
            lighter: '#F0FDF4',
            highlight: '#FDE68A',
            underline: '#A7F3D0',
            code: '#1E293B',
            codeTop: '#0F172A',
            codeText: '#E2E8F0',
            quoteText: '#065F46'
        },
        redwhite: {
            name: '红白色系',
            accent: '#DC2626',
            accent2: '#EF4444',
            deep: '#1F2937',
            body: '#374151',
            muted: '#6B7280',
            faint: '#9CA3AF',
            border: '#E5E7EB',
            light: '#FEF2F2',
            lighter: '#FFF7F7',
            highlight: '#FECACA',
            underline: '#FECACA',
            code: '#1F2937',
            codeTop: '#111827',
            codeText: '#F3F4F6',
            quoteText: '#991B1B'
        },
        graphite: {
            name: '石墨极简',
            accent: '#52525B',
            accent2: '#71717A',
            deep: '#27272A',
            body: '#52525B',
            muted: '#71717A',
            faint: '#A1A1AA',
            border: '#E4E4E7',
            light: '#FAFAFA',
            lighter: '#FFFFFF',
            highlight: '#D4D4D8',
            underline: '#52525B',
            code: '#27272A',
            codeTop: '#18181B',
            codeText: '#E4E4E7',
            quoteText: '#3F3F46'
        },
        zen: {
            name: '留白禅意',
            accent: '#4A5D52',
            accent2: '#6F8C7B',
            deep: '#2F3B34',
            body: '#4A5D52',
            muted: '#708077',
            faint: '#94A39A',
            border: '#D9E2DC',
            light: '#F4F8F5',
            lighter: '#FAFCFA',
            highlight: '#DDE8DE',
            underline: '#B5C8BC',
            code: '#27332C',
            codeTop: '#1E2922',
            codeText: '#E5EEE8',
            quoteText: '#365243'
        },
        ticket: {
            name: '摸鱼票据',
            accent: '#0F766E',
            accent2: '#14B8A6',
            deep: '#153E3A',
            body: '#334E4A',
            muted: '#5F7772',
            faint: '#8EA19D',
            border: '#C8E4DE',
            light: '#ECFDF5',
            lighter: '#F7FFFC',
            highlight: '#FDE68A',
            underline: '#99F6E4',
            code: '#183B3A',
            codeTop: '#102C2B',
            codeText: '#D9FFFA',
            quoteText: '#115E59'
        },
        olive: {
            name: '橄榄手记',
            accent: '#ED7B2F',
            accent2: '#C25B1A',
            deep: '#1E1F23',
            body: '#363634',
            muted: '#6B6B65',
            faint: '#92918A',
            border: '#D9D7CF',
            light: '#FBF4EA',
            lighter: '#FFFCF8',
            highlight: '#F6D58A',
            underline: '#EBC58D',
            code: '#242526',
            codeTop: '#1E1F20',
            codeText: '#F1EEE7',
            quoteText: '#7A4B1B'
        }
    };

    const input = document.getElementById('markdownInput');
    const preview = document.getElementById('previewContent');
    const themeSelect = document.getElementById('themeSelect');
    const status = document.getElementById('copyStatus');
    const inputStats = document.getElementById('inputStats');

    if (!input || !preview) return;

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/\n/g, ' ');
    }

    function leaf(value) {
        return '<span leaf="">' + value + '</span>';
    }

    function textLeaf(value) {
        return leaf(escapeHtml(value));
    }

    function getTheme() {
        return THEMES[themeSelect.value] || THEMES.moyu;
    }

    function readFrontMatter(source) {
        const result = { body: source, title: '', author: '', date: '', description: '' };
        if (!/^\s*---\s*(?:\r?\n|$)/.test(source)) return result;

        const lines = source.replace(/\r\n?/g, '\n').split('\n');
        let end = -1;
        for (let i = 1; i < Math.min(lines.length, 60); i++) {
            if (/^\s*---\s*$/.test(lines[i])) {
                end = i;
                break;
            }
        }
        if (end === -1) return result;

        const header = lines.slice(1, end);
        const recognized = header.length > 0 && header.every(line => {
            return !line.trim() || /^[\w-]+\s*:/.test(line);
        });
        if (!recognized) return result;

        header.forEach(line => {
            const match = line.match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
            if (!match) return;
            const key = match[1].toLowerCase();
            const value = match[2].replace(/^['"]|['"]$/g, '');
            if (key === 'title') result.title = value;
            if (key === 'author') result.author = value;
            if (key === 'date') result.date = value;
            if (key === 'description' || key === 'summary' || key === 'excerpt') result.description = value;
        });
        result.body = lines.slice(end + 1).join('\n');
        return result;
    }

    function isTableSeparator(line) {
        const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
        return cells.length > 0 && cells.every(cell => /^\s*:?-{3,}:?\s*$/.test(cell));
    }

    function tableCells(line) {
        return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
    }

    function parseBlocks(source) {
        const lines = source.replace(/\r\n?/g, '\n').split('\n');
        const blocks = [];
        let i = 0;

        function isStart(line) {
            return /^\s*(```+|~~~+)/.test(line) ||
                /^\s*#{1,6}\s+/.test(line) ||
                /^\s*>/.test(line) ||
                /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line) ||
                /^\s*(?:[-+*]|\d+[.)])\s+/.test(line);
        }

        while (i < lines.length) {
            const line = lines[i];
            if (!line.trim()) {
                i++;
                continue;
            }

            const fence = line.match(/^\s*(```+|~~~+)\s*([^\s]*)?.*$/);
            if (fence) {
                const fenceMark = fence[1][0];
                const language = fence[2] || 'code';
                const code = [];
                i++;
                while (i < lines.length && !new RegExp('^\\s*' + fenceMark + '{3,}\\s*$').test(lines[i])) {
                    code.push(lines[i]);
                    i++;
                }
                if (i < lines.length) i++;
                blocks.push({ type: 'code', language: language, lines: code });
                continue;
            }

            const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
            if (heading) {
                blocks.push({ type: 'heading', level: heading[1].length, text: heading[2].trim() });
                i++;
                continue;
            }

            if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
                blocks.push({ type: 'hr' });
                i++;
                continue;
            }

            if (/^\s*>/.test(line)) {
                const quote = [];
                while (i < lines.length && /^\s*>/.test(lines[i])) {
                    quote.push(lines[i].replace(/^\s*>\s?/, ''));
                    i++;
                }
                blocks.push({ type: 'quote', lines: quote });
                continue;
            }

            const listMatch = line.match(/^\s*(?:[-+*]|\d+[.)])\s+(.+)$/);
            if (listMatch) {
                const items = [];
                let ordered = /^\s*\d+[.)]/.test(line);
                while (i < lines.length) {
                    const item = lines[i].match(/^\s*(?:([-+*])|(\d+)[.)])\s+(.+)$/);
                    if (!item) break;
                    items.push({ text: item[3], number: item[2] || '' });
                    i++;
                    while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !isStart(lines[i])) {
                        items[items.length - 1].text += ' ' + lines[i].trim();
                        i++;
                    }
                }
                blocks.push({ type: 'list', ordered: ordered, items: items });
                continue;
            }

            if (i + 1 < lines.length && /^\s*\|?\s*[^|]+\|/.test(line) && isTableSeparator(lines[i + 1])) {
                const header = tableCells(line);
                const rows = [];
                i += 2;
                while (i < lines.length && /^\s*\|/.test(lines[i])) {
                    rows.push(tableCells(lines[i]));
                    i++;
                }
                blocks.push({ type: 'table', header: header, rows: rows });
                continue;
            }

            const paragraph = [line.trim()];
            i++;
            while (i < lines.length && lines[i].trim() && !isStart(lines[i])) {
                paragraph.push(lines[i].trim());
                i++;
            }
            blocks.push({ type: 'paragraph', lines: paragraph });
        }
        return blocks;
    }

    function renderInline(source, theme) {
        const tokens = [];
        const marker = '\uE000';
        const stash = function (html) {
            const index = tokens.push(html) - 1;
            return marker + index + marker;
        };

        let value = String(source == null ? '' : source);

        value = value.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g, function (_, alt, url, title) {
            return stash(renderImage(url, alt, title, theme));
        });
        value = value.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, function (_, label, url) {
            return stash('<a href="' + escapeAttr(url) + '" style="color:' + theme.accent + ';text-decoration:underline;">' + textLeaf(label) + '</a>');
        });
        value = value.replace(/`([^`\n]+)`/g, function (_, code) {
            return stash('<span style="background:#F3F4F6;color:#1F2937;padding:2px 6px;border-radius:4px;font-size:13px;font-weight:600;font-family:Consolas,Monaco,monospace;">' + textLeaf(code) + '</span>');
        });
        value = value.replace(/\*\*([^*\n]+)\*\*/g, function (_, text) {
            return stash('<strong style="color:' + theme.accent + ';">' + textLeaf(text) + '</strong>');
        });
        value = value.replace(/__([^_\n]+)__/g, function (_, text) {
            return stash('<strong style="color:' + theme.accent + ';">' + textLeaf(text) + '</strong>');
        });
        value = value.replace(/==([^=\n]+)==/g, function (_, text) {
            return stash('<span style="background:linear-gradient(120deg,' + theme.highlight + ' 0%,rgba(255,255,255,0) 100%);padding:0 4px;border-radius:2px;font-weight:600;color:' + theme.deep + ';">' + textLeaf(text) + '</span>');
        });
        value = value.replace(/~~([^~\n]+)~~/g, function (_, text) {
            return stash('<span style="background:#F3F4F6;color:#6B7280;padding:2px 6px;border-radius:4px;font-size:13px;text-decoration:line-through;font-weight:600;">' + textLeaf(text) + '</span>');
        });
        value = value.replace(/\*([^*\n]+)\*/g, function (_, text) {
            return stash('<em style="color:' + theme.body + ';">' + textLeaf(text) + '</em>');
        });
        value = value.replace(/_([^_\n]+)_/g, function (_, text) {
            return stash('<em style="color:' + theme.body + ';">' + textLeaf(text) + '</em>');
        });

        value = escapeHtml(value);
        const parts = value.split(marker);
        let output = '';
        parts.forEach(function (part, index) {
            if (index % 2 === 0) {
                if (part) output += leaf(part.replace(/\n/g, '<br>'));
            } else {
                output += tokens[Number(part)] || '';
            }
        });
        return output;
    }

    function renderImage(url, alt, title, theme) {
        const caption = alt ? '<p style="font-size:12px;color:' + theme.faint + ';text-align:center;margin:0 0 24px;">' + textLeaf('— ' + alt) + '</p>' : '';
        return '<section style="background:#FFFFFF;border-radius:12px;padding:6px;border:1px solid ' + theme.border + ';box-shadow:0 4px 12px -2px rgba(0,0,0,0.08);margin:0 20px 8px;">' +
            '<section style="margin:0;border-radius:8px;overflow:hidden;">' +
            '<span leaf=""><img src="' + escapeAttr(url) + '"' + (title ? ' title="' + escapeAttr(title) + '"' : '') + ' alt="' + escapeAttr(alt || '') + '" style="max-width:100%;height:auto;display:block;margin:0 auto;">' +
            '</span></section></section>' + caption;
    }

    function renderCover(title, meta, theme) {
        const date = meta.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
        const description = meta.description || '把一篇 Markdown 笔记，整理成可以直接阅读和分享的公众号文章。';
        return '<section style="margin:0 20px 32px;background:#FFFFFF;border:1.5px solid rgba(5,150,105,0.15);border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);width:calc(100% - 40px);">' +
            '<section style="padding:30px 24px 26px;">' +
            '<section style="display:flex;align-items:center;gap:8px;margin-bottom:26px;">' +
            '<span style="display:inline-block;width:6px;height:6px;background:' + theme.accent + ';border-radius:50%;"><span leaf=""><br></span></span>' +
            '<span style="font-size:11px;font-weight:700;letter-spacing:3px;color:' + theme.accent + ';">' + textLeaf('MARKDOWN · NOTES') + '</span>' +
            '<section style="flex:1;height:1px;overflow:hidden;background:linear-gradient(to right,rgba(5,150,105,0.2),transparent);"><span leaf=""><br></span></section>' +
            '<span style="font-size:10px;color:' + theme.faint + ';font-weight:600;">' + textLeaf(date) + '</span>' +
            '</section>' +
            '<p style="font-size:25px;font-weight:900;color:' + theme.deep + ';margin:0 0 14px;line-height:1.24;letter-spacing:-0.8px;">' + renderInline(title, theme) + '</p>' +
            '<section style="width:48px;height:3px;background:linear-gradient(to right,' + theme.accent + ',' + theme.accent2 + ');border-radius:2px;margin-bottom:14px;"><span leaf=""><br></span></section>' +
            '<p style="font-size:13px;color:' + theme.faint + ';margin:0;line-height:1.7;letter-spacing:0.4px;">' + textLeaf(description) + '</p>' +
            '</section>' +
            '<section style="background:linear-gradient(135deg,' + theme.accent + ',' + theme.accent2 + ');padding:11px 24px;display:flex;align-items:center;justify-content:space-between;">' +
            '<p style="font-size:11px;color:rgba(255,255,255,0.9);margin:0;font-weight:600;letter-spacing:0.5px;">' + textLeaf(meta.author || 'Akira\'s Notes') + '</p>' +
            '<span style="background:rgba(255,255,255,0.2);padding:2px 7px;border-radius:3px;font-size:9px;color:#fff;font-weight:700;">' + textLeaf(theme.name) + '</span>' +
            '</section></section>';
    }

    function renderPlainTitle(title, meta, theme) {
        const details = [meta.author, meta.date].filter(Boolean).join(' · ');
        const detailHtml = details ? '<p style="margin:10px 0 0;font-size:12px;color:' + theme.faint + ';line-height:1.6;">' + textLeaf(details) + '</p>' : '';
        return '<section style="margin:0 20px 28px;padding:0 0 16px;border-bottom:2px solid ' + theme.border + ';">' +
            '<p style="margin:0;font-size:24px;font-weight:900;color:' + theme.deep + ';line-height:1.35;letter-spacing:-0.3px;">' + renderInline(title, theme) + '</p>' +
            detailHtml +
            '</section>';
    }

    function renderToc(headings, theme) {
        if (headings.length < 2) return '';
        const cards = headings.map(function (heading, index) {
            const active = index === 0;
            const background = active ? 'linear-gradient(135deg,' + theme.accent + ',' + theme.accent2 + ')' : '#FFFFFF';
            const color = active ? '#FFFFFF' : theme.deep;
            const minor = active ? 'rgba(255,255,255,0.72)' : theme.faint;
            return '<section style="display:inline-block;white-space:normal;vertical-align:top;width:130px;background:' + background + ';border:1px solid ' + (active ? theme.accent : theme.border) + ';border-radius:12px;padding:12px;margin-right:8px;box-shadow:0 2px 6px rgba(0,0,0,0.04);">' +
                '<p style="font-size:9px;font-weight:700;color:' + minor + ';letter-spacing:1px;margin:0 0 5px;">' + textLeaf('PART ' + String(index + 1).padStart(2, '0')) + '</p>' +
                '<p style="font-size:13px;font-weight:800;color:' + color + ';margin:0;line-height:1.45;">' + renderInline(heading, theme) + '</p></section>';
        }).join('');
        return '<section style="margin:0 20px 30px;">' +
            '<section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
            '<p style="font-size:10px;color:' + theme.faint + ';margin:0;text-transform:uppercase;letter-spacing:2px;font-weight:600;">' + textLeaf(headings.length + ' PARTS') + '</p>' +
            '<p style="font-size:10px;color:' + theme.faint + ';margin:0;">' + textLeaf('横向滑动 →') + '</p></section>' +
            '<section style="overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap;padding-bottom:8px;">' + cards + '</section></section>';
    }

    function renderChapter(text, number, theme) {
        return '<section style="margin:46px 20px 24px;">' +
            '<section style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">' +
            '<section style="text-align:center;flex-shrink:0;min-width:42px;">' +
            '<p style="margin:0;font-size:27px;font-weight:900;color:' + theme.accent + ';line-height:1;letter-spacing:-2px;">' + textLeaf(String(number).padStart(2, '0')) + '</p>' +
            '<p style="margin:0;font-size:8px;font-weight:700;color:' + theme.faint + ';letter-spacing:2px;">' + textLeaf('PART') + '</p></section>' +
            '<span style="display:inline-block;width:1px;height:36px;background:' + theme.border + ';flex-shrink:0;"><span leaf=""><br></span></span>' +
            '<p style="margin:0;font-size:18px;font-weight:900;color:' + theme.deep + ';letter-spacing:0.2px;line-height:1.45;">' + renderInline(text, theme) + '</p>' +
            '</section></section>';
    }

    function renderSubheading(text, theme) {
        return '<p style="margin:30px 20px 14px;font-size:16px;font-weight:800;color:' + theme.deep + ';line-height:1.5;border-left:4px solid ' + theme.accent + ';padding-left:12px;">' + renderInline(text, theme) + '</p>';
    }

    function renderParagraph(lines, theme) {
        return '<p style="margin:0 20px 17px;font-size:14px;line-height:1.9;text-align:justify;letter-spacing:0.15px;">' + renderInline(lines.join(''), theme) + '</p>';
    }

    function renderQuote(lines, theme) {
        return '<section style="margin:0 20px 24px;background:' + theme.light + ';border-radius:0 10px 10px 0;border-left:4px solid ' + theme.accent + ';padding:16px 20px;">' +
            '<p style="font-size:15px;font-weight:800;color:' + theme.quoteText + ';margin:0;line-height:1.85;">' + renderInline(lines.join(''), theme) + '</p></section>';
    }

    function renderList(block, theme) {
        const items = block.items.map(function (item, index) {
            const marker = block.ordered ? String(index + 1).padStart(2, '0') : '•';
            const markerStyle = block.ordered ? 'background:' + theme.light + ';color:' + theme.quoteText + ';border-radius:5px;padding:1px 7px;margin-right:8px;font-weight:900;' : 'color:' + theme.accent + ';font-weight:900;margin-right:8px;';
            return '<p style="font-size:14px;color:' + theme.body + ';margin:0 20px 10px;line-height:1.85;">' +
                '<span style="display:inline-block;' + markerStyle + '">' + textLeaf(marker) + '</span>' + renderInline(item.text, theme) + '</p>';
        }).join('');
        return '<section style="margin:0 0 20px;">' + items + '</section>';
    }

    function renderTable(block, theme) {
        const allRows = [block.header].concat(block.rows);
        const rows = allRows.map(function (row, rowIndex) {
            const cells = row.map(function (cell) {
                return '<span style="flex:1;min-width:0;padding:9px 10px;color:' + (rowIndex === 0 ? theme.deep : theme.body) + ';font-size:13px;line-height:1.65;font-weight:' + (rowIndex === 0 ? '800' : '400') + ';">' + renderInline(cell, theme) + '</span>';
            }).join('');
            return '<section style="display:flex;align-items:stretch;border-bottom:1px solid ' + theme.border + ';background:' + (rowIndex === 0 ? theme.light : '#FFFFFF') + ';">' + cells + '</section>';
        }).join('');
        return '<section style="margin:0 20px 24px;border:1px solid ' + theme.border + ';border-radius:8px;overflow:hidden;">' + rows + '</section>';
    }

    function renderCode(block, theme) {
        const lines = block.lines.length ? block.lines : [''];
        const rows = lines.map(function (line) {
            const visual = escapeHtml(line).replace(/  /g, '　　');
            return '<p style="margin:0;font-family:Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:' + theme.codeText + ';overflow-wrap:anywhere;">' + leaf(visual || '&nbsp;') + '</p>';
        }).join('');
        return '<section style="margin:0 20px 24px;border-radius:8px;overflow:hidden;background:' + theme.code + ';box-shadow:0 4px 16px -8px rgba(15,23,42,0.4);">' +
            '<section style="display:flex;align-items:center;padding:9px 14px;background:' + theme.codeTop + ';">' +
            '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">' + leaf('.') + '</span>' +
            '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:7px;font-size:0;line-height:0;overflow:hidden;">' + leaf('.') + '</span>' +
            '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;font-size:0;line-height:0;overflow:hidden;">' + leaf('.') + '</span>' +
            '<span style="margin-left:12px;font-size:12px;color:' + theme.faint + ';font-family:Consolas,Monaco,monospace;letter-spacing:1px;">' + textLeaf(block.language || 'code') + '</span></section>' +
            '<section style="padding:11px 14px;">' + rows + '</section></section>';
    }

    function renderDocument(source, theme) {
        const meta = readFrontMatter(source);
        const blocks = parseBlocks(meta.body);
        let title = meta.title;
        let titleIndex = -1;

        blocks.forEach(function (block, index) {
            if (!title && block.type === 'heading' && block.level === 1) {
                title = block.text;
                titleIndex = index;
            }
        });
        if (!title) title = '未命名文章';

        const output = [];
        // 公众号正文从标题直接开始，不自动插入封面卡片和横向目录。
        output.push(renderPlainTitle(title, meta, theme));

        let chapter = 0;
        blocks.forEach(function (block, index) {
            if (block.type === 'heading' && block.level === 1 && (index === titleIndex || (!meta.title && titleIndex === -1))) return;
            if (block.type === 'heading' && block.level === 2) {
                chapter++;
                output.push(renderChapter(block.text, chapter, theme));
                return;
            }
            if (block.type === 'heading' && block.level >= 3) {
                output.push(renderSubheading(block.text, theme));
                return;
            }
            if (block.type === 'paragraph') output.push(renderParagraph(block.lines, theme));
            if (block.type === 'quote') output.push(renderQuote(block.lines, theme));
            if (block.type === 'list') output.push(renderList(block, theme));
            if (block.type === 'table') output.push(renderTable(block, theme));
            if (block.type === 'code') output.push(renderCode(block, theme));
            if (block.type === 'hr') output.push('<section style="height:1px;background:' + theme.border + ';margin:28px 20px 28px;"><span leaf=""><br></span></section>');
        });

        if (!blocks.length) {
            output.push('<p style="margin:0 20px 24px;font-size:14px;line-height:1.9;color:' + theme.muted + ';">' + textLeaf('请在左侧粘贴 Markdown 内容。') + '</p>');
        }

        return '<section style="max-width:677px;margin:0 auto;background:#FFFFFF;font-family:-apple-system,BlinkMacSystemFont,\'PingFang SC\',\'Hiragino Sans GB\',\'Microsoft YaHei\',sans-serif;color:' + theme.body + ';line-height:1.75;letter-spacing:0.5px;overflow-x:hidden;">' + output.join('') + '</section>';
    }

    function setStatus(message, state) {
        status.textContent = message;
        if (state) status.dataset.state = state;
        else delete status.dataset.state;
    }

    function updateStats() {
        const value = input.value || '';
        const chars = value.replace(/\s/g, '').length;
        const lines = value ? value.split(/\r?\n/).length : 0;
        inputStats.textContent = chars + ' 字 · ' + lines + ' 行';
    }

    function render() {
        preview.innerHTML = renderDocument(input.value, getTheme());
        updateStats();
        setStatus('修改左侧内容，右侧会实时更新');
        try {
            localStorage.setItem('wechat-markdown-draft', input.value);
            localStorage.setItem('wechat-markdown-theme', themeSelect.value);
        } catch (e) {}
    }

    async function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(area);
        if (!ok) throw new Error('copy failed');
    }

    function fallbackRichCopy(html) {
        const holder = document.createElement('div');
        holder.contentEditable = 'true';
        holder.style.position = 'fixed';
        holder.style.left = '-99999px';
        holder.style.top = '0';
        holder.innerHTML = html;
        document.body.appendChild(holder);
        const range = document.createRange();
        range.selectNodeContents(holder);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        const ok = document.execCommand('copy');
        selection.removeAllRanges();
        document.body.removeChild(holder);
        if (!ok) throw new Error('copy failed');
    }

    async function copyRichText() {
        const html = preview.innerHTML;
        const text = preview.innerText || preview.textContent || '';
        try {
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({
                    'text/html': new Blob([html], { type: 'text/html' }),
                    'text/plain': new Blob([text], { type: 'text/plain' })
                });
                await navigator.clipboard.write([item]);
            } else {
                fallbackRichCopy(html);
            }
            setStatus('已复制富文本，可以粘贴到公众号编辑器', 'success');
        } catch (error) {
            try {
                fallbackRichCopy(html);
                setStatus('已复制富文本，可以粘贴到公众号编辑器', 'success');
            } catch (fallbackError) {
                setStatus('复制失败，请允许剪贴板权限后重试', 'error');
            }
        }
    }

    function downloadHtml() {
        const html = '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>公众号排版文章</title></head><body>' + preview.innerHTML + '</body></html>';
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '公众号排版.html';
        link.click();
        URL.revokeObjectURL(url);
        setStatus('HTML 文件已下载', 'success');
    }

    function setupThemeToggle() {
        const button = document.getElementById('themeToggle');
        const meta = document.querySelector('meta[name="theme-color"]');
        if (!button) return;
        const sync = function () {
            if (meta) meta.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#000000' : '#ffffff');
        };
        sync();
        button.addEventListener('click', function () {
            const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = next;
            try { localStorage.setItem('theme', next); } catch (e) {}
            sync();
        });
    }

    function setupNav() {
        const nav = document.getElementById('navbar');
        if (nav) {
            const update = function () { nav.classList.toggle('scrolled', window.scrollY > 12); };
            window.addEventListener('scroll', update, { passive: true });
            update();
        }
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function () {
                navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            });
        }
    }

    function setup() {
        let savedDraft = '';
        let savedTheme = '';
        try {
            savedDraft = localStorage.getItem('wechat-markdown-draft') || '';
            savedTheme = localStorage.getItem('wechat-markdown-theme') || '';
        } catch (e) {}
        input.value = savedDraft || SAMPLE;
        if (THEMES[savedTheme]) themeSelect.value = savedTheme;

        input.addEventListener('input', render);
        themeSelect.addEventListener('change', render);
        document.getElementById('loadSample').addEventListener('click', function () {
            input.value = SAMPLE;
            render();
            input.focus();
        });
        document.getElementById('clearInput').addEventListener('click', function () {
            input.value = '';
            render();
            input.focus();
        });
        document.getElementById('copyWechat').addEventListener('click', copyRichText);
        document.getElementById('copyHtml').addEventListener('click', async function () {
            try {
                await copyText(preview.innerHTML);
                setStatus('HTML 源码已复制', 'success');
            } catch (e) {
                setStatus('复制失败，请检查剪贴板权限', 'error');
            }
        });
        document.getElementById('downloadHtml').addEventListener('click', downloadHtml);
        document.getElementById('markdownFile').addEventListener('change', function (event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function () {
                input.value = String(reader.result || '');
                render();
                setStatus('已导入 ' + file.name, 'success');
            };
            reader.readAsText(file, 'utf-8');
            event.target.value = '';
        });
        input.addEventListener('dragover', function (event) {
            event.preventDefault();
            input.classList.add('is-dragging');
        });
        input.addEventListener('dragleave', function () { input.classList.remove('is-dragging'); });
        input.addEventListener('drop', function (event) {
            event.preventDefault();
            input.classList.remove('is-dragging');
            const file = event.dataTransfer.files && event.dataTransfer.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function () {
                input.value = String(reader.result || '');
                render();
                setStatus('已导入 ' + file.name, 'success');
            };
            reader.readAsText(file, 'utf-8');
        });

        setupThemeToggle();
        setupNav();
        render();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
    else setup();
})();
