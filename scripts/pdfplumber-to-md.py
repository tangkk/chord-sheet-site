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


def is_section_line(text: str) -> bool:
    return bool(re.fullmatch(r'[A-Za-z][A-Za-z0-9 _/-]*:', text.strip()))


def chord_token_count(text: str) -> int:
    return len(re.findall(r'[A-G](?:#|b)?(?:m|maj|min|sus|add|aug|dim)?\d*(?:[#b]\d+)?(?:/[A-G](?:#|b)?)?', text))


def is_chord_line(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return False
    if re.search(r'[\u4e00-\u9fff]', stripped):
        return False
    count = chord_token_count(stripped)
    return count > 0


def is_lyric_line(text: str) -> bool:
    return bool(re.search(r'[\u4e00-\u9fffA-Za-z]', text)) and not is_chord_line(text)


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


def build_body(lines):
    content = []
    skip_titles = {'Page 1', 'Page 2'}
    title_skipped = False
    i = 0
    while i < len(lines):
        raw = norm(lines[i]['text']).strip()
        if raw in skip_titles:
            i += 1
            continue
        if not title_skipped:
            title_skipped = True
            i += 1
            continue
        if is_section_line(raw):
            content.append(raw.lower())
            content.append('')
            i += 1
            continue
        if is_chord_line(raw) and i + 1 < len(lines):
            next_raw = norm(lines[i + 1]['text']).strip()
            if is_lyric_line(next_raw):
                content.append(inject(lines[i], lines[i + 1]))
                i += 2
                continue
            content.append(raw)
            i += 1
            continue
        content.append(raw)
        i += 1

    cleaned = []
    for line in content:
        if line == '' and (not cleaned or cleaned[-1] == ''):
            continue
        cleaned.append(line)
    if cleaned and cleaned[-1] != '':
        cleaned.append('')
    return cleaned


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
    parts.extend(['---', ''])
    parts.extend(body_lines)
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
    body_lines = build_body(lines)

    if args.debug_json:
        debug = []
        for line in lines:
            debug.append({
                'page': line['page'],
                'top': line['top'],
                'text': norm(line['text']),
                'kind': 'section' if is_section_line(norm(line['text']).strip()) else ('chord' if is_chord_line(norm(line['text']).strip()) else 'lyric-or-other'),
            })
        debug_path = Path(args.debug_json)
        debug_path.parent.mkdir(parents=True, exist_ok=True)
        debug_path.write_text(json.dumps(debug, ensure_ascii=False, indent=2))

    md = build_md(args.title, args.artist, args.language, args.original_key, args.tags, body_lines)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(md + '\n')
    print(f'wrote {args.out}')
    print(f'processed {len(lines)} pdf lines via pdfplumber')


if __name__ == '__main__':
    main()
