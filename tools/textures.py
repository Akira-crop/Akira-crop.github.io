# -*- coding: utf-8 -*-
"""生成「我的世界」风格的 16x16 像素纹理(放大 4 倍存为 64x64 PNG)。
不依赖任何第三方库,纯标准库实现 PNG 编码。
用法: python tools/textures.py
"""
import os
import struct
import zlib

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'images')
SCALE = 4
SIZE = 16


# ---------- PNG 编码 ----------
def write_png(path, rows):
    h = len(rows)
    w = len(rows[0])
    raw = bytearray()
    for row in rows:
        raw.append(0)  # filter type 0
        for (r, g, b) in row:
            raw += bytes((r & 255, g & 255, b & 255))

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', ihdr)
           + chunk(b'IDAT', zlib.compress(bytes(raw), 9))
           + chunk(b'IEND', b''))
    with open(path, 'wb') as f:
        f.write(png)


def upscale(rows, k):
    out = []
    for row in rows:
        big = []
        for px in row:
            big.extend([px] * k)
        for _ in range(k):
            out.append(list(big))
    return out


# ---------- 确定性伪随机 ----------
def rng(seed):
    state = [seed & 0xffffffff]

    def nxt():
        state[0] = (1103515245 * state[0] + 12345) & 0x7fffffff
        return state[0]

    return nxt


def jitter(base, r, span):
    """在 base 上叠加 ±span 的噪声"""
    return tuple(max(0, min(255, c + r() % (span * 2 + 1) - span)) for c in base)


# ---------- 纹理 ----------
def grass_top():
    r = rng(11)
    out = []
    for _ in range(SIZE):
        out.append([jitter((106, 168, 64), r, 22) for _ in range(SIZE)])
    return out


def dirt():
    r = rng(23)
    out = []
    for _ in range(SIZE):
        row = []
        for _ in range(SIZE):
            v = r()
            if v % 11 == 0:
                row.append((106, 76, 51))
            elif v % 17 == 0:
                row.append((158, 118, 86))
            else:
                row.append(jitter((134, 96, 67), r, 16))
        out.append(row)
    return out


def grass_side():
    r = rng(37)
    d = dirt()
    out = []
    for y in range(SIZE):
        row = []
        for x in range(SIZE):
            if y < 3 or (y == 3 and r() % 2 == 0):
                row.append(jitter((106, 168, 64), r, 20))
            else:
                row.append(d[y][x])
        out.append(row)
    return out


def stone():
    r = rng(41)
    out = []
    for _ in range(SIZE):
        row = []
        for _ in range(SIZE):
            v = r()
            if v % 23 == 0:
                row.append((108, 108, 108))
            elif v % 29 == 0:
                row.append((146, 146, 146))
            else:
                row.append(jitter((126, 126, 126), r, 12))
        out.append(row)
    return out


def cobblestone():
    r = rng(53)
    shades = [(88, 88, 88), (112, 112, 112), (132, 132, 132), (150, 150, 150), (100, 100, 100)]
    blocks = [[shades[r() % len(shades)] for _ in range(4)] for _ in range(4)]
    out = []
    for y in range(SIZE):
        row = []
        for x in range(SIZE):
            bx, by = x // 4, y // 4
            edge = (x % 4 == 0) or (y % 4 == 0) or (x % 4 == 3 and y % 4 == 3)
            base = blocks[by][bx]
            if edge:
                row.append(tuple(max(0, c - 34) for c in base))
            else:
                row.append(jitter(base, r, 10))
        out.append(row)
    return out


def planks():
    r = rng(67)
    out = []
    for y in range(SIZE):
        row = []
        for x in range(SIZE):
            band = y // 4
            base = [(160, 128, 78), (172, 139, 86), (150, 118, 70), (166, 133, 82)][band % 4]
            px = jitter(base, r, 8)
            if y % 4 == 3:
                px = (118, 92, 52)
            if (band % 2 == 0 and x == 3) or (band % 2 == 1 and x == 11):
                px = (124, 98, 56)
            row.append(px)
        out.append(row)
    return out


def obsidian():
    r = rng(79)
    out = []
    for _ in range(SIZE):
        row = []
        for _ in range(SIZE):
            v = r()
            if v % 19 == 0:
                row.append((58, 40, 84))
            elif v % 13 == 0:
                row.append((38, 26, 58))
            else:
                row.append(jitter((24, 16, 38), r, 8))
        out.append(row)
    return out


def bedrock():
    r = rng(83)
    out = []
    for _ in range(SIZE):
        row = []
        for _ in range(SIZE):
            v = r()
            if v % 9 == 0:
                row.append((60, 60, 60))
            elif v % 7 == 0:
                row.append((110, 110, 110))
            else:
                row.append(jitter((82, 82, 82), r, 16))
        out.append(row)
    return out


def diamond_block():
    r = rng(97)
    out = []
    for y in range(SIZE):
        row = []
        for x in range(SIZE):
            # 菱形花纹
            dx = abs((x % 8) - 3.5)
            dy = abs((y % 8) - 3.5)
            if dx + dy < 2.4:
                row.append((196, 250, 246))
            elif dx + dy < 4.2:
                row.append((92, 219, 213))
            else:
                row.append(jitter((70, 168, 168), r, 10))
        out.append(row)
    return out


def gold_block():
    r = rng(101)
    out = []
    for y in range(SIZE):
        row = []
        for x in range(SIZE):
            dx = abs((x % 8) - 3.5)
            dy = abs((y % 8) - 3.5)
            if dx + dy < 2.2:
                row.append((255, 246, 180))
            elif dx + dy < 4.0:
                row.append((249, 213, 74))
            else:
                row.append(jitter((200, 160, 40), r, 12))
        out.append(row)
    return out


def bookshelf():
    r = rng(103)
    p = planks()
    book_colors = [(150, 60, 60), (70, 100, 150), (100, 140, 70), (170, 140, 60), (120, 80, 140)]
    out = []
    for y in range(SIZE):
        row = []
        for x in range(SIZE):
            if 3 <= y <= 12 and x % 3 != 2:
                row.append(jitter(book_colors[(x * 3 + y) % len(book_colors)], r, 14))
            else:
                row.append(p[y][x])
        out.append(row)
    return out


def creeper_face():
    """苦力怕的脸,8x8 网格放大两倍填满 16x16"""
    r = rng(107)
    face = [
        "00000000",
        "01100110",
        "01100110",
        "00011000",
        "00111100",
        "01100110",
        "01100110",
        "00000000",
    ]
    out = []
    for y in range(SIZE):
        row = []
        for x in range(SIZE):
            fy, fx = y // 2, x // 2
            if face[fy][fx] == '1':
                row.append((20, 20, 20))
            else:
                v = r()
                row.append((70, 160, 60) if v % 5 else (56, 138, 48))
        out.append(row)
    return out


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    textures = {
        'grass_top.png': grass_top(),
        'grass_side.png': grass_side(),
        'dirt.png': dirt(),
        'stone.png': stone(),
        'cobblestone.png': cobblestone(),
        'planks.png': planks(),
        'obsidian.png': obsidian(),
        'bedrock.png': bedrock(),
        'diamond_block.png': diamond_block(),
        'gold_block.png': gold_block(),
        'bookshelf.png': bookshelf(),
        'creeper.png': creeper_face(),
    }
    for name, rows in textures.items():
        write_png(os.path.join(OUT_DIR, name), upscale(rows, SCALE))
        print('texture:', name)

    # 站点图标:草方块
    write_png(os.path.join(OUT_DIR, 'favicon.png'), upscale(grass_top(), 4))
    print('texture: favicon.png')


if __name__ == '__main__':
    main()
