#!/usr/bin/env python3
import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

import pdfplumber


def norm(text: str) -> str:
    return (
        text.replace('⼀', '一')
        .replace('⿊', '黑')
        .replace('⻄', '西')
        .replace('⻑', '长')
        .replace('⾵', '风')
        .replace('⽔', '水')
        .replace('⽣', '生')
        .replace('⽤', '用')
        .replace('⾥', '里')
        .replace('⼈', '人')
        .replace('⼤', '大')
        .replace('⼥', '女')
        .replace('⽜', '牛')
        .replace('⽚', '片')
        .replace('⽼', '老')
        .replace('⾶', '飞')
    )


def is_chord_line(text: str) -> bool:
    return bool(re.fullmatch(r'[A-G0-9#bmsuajdin/\sF]+', text)) and any(ch in 'ABCDEFG' for ch in text)


def group_lines(pdf_path: Path):
    lines = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page_idx, page in enumerate(pdf.pages, 1):
            grouped = defaultdict(list)
            for ch in page.chars:
                grouped[round(ch['top'], 1)].append(ch)
            for top in sorted(grouped):
                chars = sorted(grouped[top], key=lambda c: c['x0'])
                text = ''.join(c['text'] for c in chars).rstrip()
                if not text.strip():
                    continue
                lines.append({'page': page_idx, 'top': top, 'text': text, 'chars': chars})
    return lines


def pair_lines(lines):
    content = [ln for ln in lines if ln['text'].strip() not in {'⿊洞裡', 'Page 1', 'Page 2', '我在⿊洞裡'}]
    pairs = []
    i = 0
    while i < len(content) - 1:
        a, b = content[i], content[i + 1]
        if is_chord_line(a['text']) and re.search(r'[\u4e00-\u9fff]', b['text']):
            pairs.append((a, b))
            i += 2
        else:
            i += 1
    return pairs


def inject(chord_line, lyric_line):
    chars = lyric_line['chars']
    inserts = [[] for _ in range(len(chars) + 1)]
    for m in re.finditer(r'[A-G](?:#|b)?(?:[^\s]*)', chord_line['text']):
        tok = m.group(0)
        token_chars = chord_line['chars'][m.start():m.end()]
        if not token_chars:
            continue
        x = token_chars[0]['x0']
        best = 0
        best_dist = float('inf')
        for idx, c in enumerate(chars):
            dist = abs(c['x0'] - x)
            if dist < best_dist:
                best = idx
                best_dist = dist
        inserts[best].append(tok)

    out = []
    for idx, c in enumerate(chars):
        if inserts[idx]:
            out.extend(f'( {t} )' for t in inserts[idx])
        out.append(norm(c['text']))
    return ''.join(out).replace('　', ' ')


def build_md(title: str, artist: str, language: str, original_key: str, tags, body_lines):
    parts = [
        '---',
        f'title: {title}',
        f'artist: {artist}',
        f'language: {language}',
        f'originalKey: {original_key}',
        'capo: 0',
        'tags:',
    ]
    for tag in tags:
        parts.append(f'  - {tag}')
    parts.extend([
        '---',
        '',
        'verse 1:',
        '',
        *body_lines[0:4],
        '',
        'chorus:',
        '',
        *body_lines[4:7],
        '',
        'verse 2:',
        '',
        *body_lines[7:11],
        '',
        'chorus:',
        '',
        *body_lines[11:14],
        '',
        'bridge:',
        '',
        *body_lines[14:16],
        '',
        'chorus:',
        '',
        *body_lines[16:19],
        '',
        'outro:',
        '',
        '( Bm7 )我 ( C#m7 )在 ( Dmaj7 )黑 ( E11 )洞 ( Amaj7 )裡',
        '',
    ])
    return '\n'.join(parts)


def main():
    parser = argparse.ArgumentParser(description='Convert chord-sheet PDF into md draft via pdfplumber coordinates.')
    parser.add_argument('pdf')
    parser.add_argument('--out', required=True)
    parser.add_argument('--title', required=True)
    parser.add_argument('--artist', required=True)
    parser.add_argument('--language', default='zh')
    parser.add_argument('--original-key', required=True)
    parser.add_argument('--tags', nargs='*', default=[])
    parser.add_argument('--debug-json')
    args = parser.parse_args()

    lines = group_lines(Path(args.pdf))
    pairs = pair_lines(lines)
    body_lines = [inject(chord, lyric) for chord, lyric in pairs]

    if args.debug_json:
        debug = []
        for chord, lyric in pairs:
            debug.append({
                'chord_top': chord['top'],
                'chord_text': chord['text'],
                'lyric_top': lyric['top'],
                'lyric_text': norm(lyric['text']),
            })
        Path(args.debug_json).write_text(json.dumps(debug, ensure_ascii=False, indent=2))

    md = build_md(args.title, args.artist, args.language, args.original_key, args.tags, body_lines)
    Path(args.out).write_text(md + '\n')
    print(f'wrote {args.out}')
    print(f'paired {len(pairs)} chord/lyric lines via pdfplumber')


if __name__ == '__main__':
    main()
