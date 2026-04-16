#!/usr/bin/env python3
# PDF -> markdown 草案脚本（当前 chord-sheet-site 的主入口）
#
# 脚本位置：scripts/pdfplumber-to-md.py
#
# 用途：
# - 读取 chord sheet PDF
# - 用 pdfplumber 取字符坐标 / 行坐标
# - 输出项目可审阅的 md 草案（frontmatter + body）
#
# 推荐直接调用方式：
#   cd ~/Documents/Projects/chord-sheet-site
#   python3 scripts/pdfplumber-to-md.py \
#     "/path/to/song.pdf" \
#     --out src/data/song-slug.md \
#     --title "歌名" \
#     --artist "歌手" \
#     --language yue \
#     --original-key C \
#     --tags 粤语 流行 歌手名 \
#     --debug-json tmp/song-slug-pdfplumber-debug.json
#
# package.json 里也有包装命令：
#   pnpm pdfplumber:md -- "/path/to/song.pdf" --out ... --title ... --artist ... --original-key ...
#
# 常用参数：
# - pdf             输入 PDF 路径（必填，位置参数）
# - --out           输出 md 路径（必填）
# - --title         歌名（必填）
# - --artist        歌手（必填）
# - --language      语言，默认 zh
# - --original-key  原调（必填）
# - --tags          标签，可写多个
# - --debug-json    输出调试 JSON，便于查分类/对位问题
#
# 看 usage：
#   python3 scripts/pdfplumber-to-md.py -h
import argparse
import json
import re
from collections import defaultdict
from pathlib import Path
from statistics import median

import pdfplumber


CHORD_TOKEN_RE = re.compile(
    r'(?<![A-Za-z0-9])'
    r'([A-G](?:#|b)?(?:maj|min|dim|aug|m|M)?(?:(?:2|4|5|6|7|9|11|13)(?:sus(?:2|4)?)?|sus(?:2|4)?(?:(?:[#b](?:5|6|9|11|13))|(?:[#b](?:5|6|9|11|13)){2})?|add(?:2|4|5|6|7|9|11|13){1,2}|no(?:3|5)|alt|(?:[#b+](?:5|9|11|13)))*(?:/[A-G](?:#|b)?)?)'
    r'(?![A-Za-z0-9])'
)
SECTION_LINE_RE = re.compile(r'[A-Za-z][A-Za-z0-9 _/\-()]*:')
LABEL_LINE_RE = re.compile(r"[A-Za-z][A-Za-z0-9 '&/\-]{0,24}")
HIGH_CONFIDENCE_SECTION_RE = re.compile(r'^(verse(?:\s+\d+)?|chorus|bridge|pre-chorus|pre chorus|intro|outro|instrumental|inst|solo|interlude|tag|ending|end|refrain|hook|final chorus)$', re.IGNORECASE)
PUNCT_ONLY_RE = re.compile(r'^[\s.·•⋯…-]+$')
INLINE_SYMBOL_ONLY_RE = re.compile(r'^[*#※]+$')
CHINESE_RE = re.compile(r'[\u4e00-\u9fff]')
LETTER_RE = re.compile(r'[A-Za-z]')
ENDING_CHORD_LINE_RE = re.compile(r'^\s*[.·•⋯…-]*\s*(?:\d+\.)?\s*[A-G](?:#|b)?')


def norm(text: str) -> str:
    return (
        text.replace('⼀', '一')
        .replace('⿊', '黑')
        .replace('⻄', '西')
        .replace('⻑', '长')
        .replace('⾵', '风')
        .replace('⻛', '风')
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


def canonical_text(text: str) -> str:
    return norm(text).replace('　', ' ').rstrip()


def is_section_line(text: str) -> bool:
    return bool(SECTION_LINE_RE.fullmatch(text.strip()))


def find_chord_tokens(text: str):
    return [m for m in CHORD_TOKEN_RE.finditer(text)]


def chord_stats(text: str):
    stripped = text.strip()
    tokens = find_chord_tokens(stripped)
    significant = re.sub(r'[\s\-–—()\[\]{}|.:·•⋯…]+', '', stripped)
    token_chars = sum(len(m.group(1)) for m in tokens)
    coverage = token_chars / len(significant) if significant else 0.0
    remainder = stripped
    for match in reversed(tokens):
        start, end = match.span(1)
        remainder = remainder[:start] + (' ' * (end - start)) + remainder[end:]
    remainder = re.sub(r'[\s\-–—()\[\]{}|.:,·•⋯…]+', '', remainder)
    has_noise = bool(remainder)
    return {
        'tokens': [m.group(1) for m in tokens],
        'count': len(tokens),
        'coverage': coverage,
        'significant_len': len(significant),
        'has_noise': has_noise,
    }


def classify_text(text: str, *, same_row_group_size: int = 1):
    stripped = text.strip()
    if not stripped:
        return 'blank'
    if PUNCT_ONLY_RE.fullmatch(stripped):
        return 'blank'
    if INLINE_SYMBOL_ONLY_RE.fullmatch(stripped):
        return 'inline-symbol'
    if is_section_line(stripped):
        return 'section'
    stats = chord_stats(stripped)
    if stats['count'] >= 1:
        return 'chord'
    if not CHINESE_RE.search(stripped):
        if same_row_group_size > 1 and LABEL_LINE_RE.fullmatch(stripped):
            return 'label'
        if LABEL_LINE_RE.fullmatch(stripped) and stats['count'] == 0:
            return 'label'
    if CHINESE_RE.search(stripped) or LETTER_RE.search(stripped):
        return 'lyric'
    return 'other'


def is_ghost_blank(chars, text: str) -> bool:
    stripped = canonical_text(text).strip()
    if stripped:
        return False
    if not chars:
        return False
    width = max(c['x1'] for c in chars) - min(c['x0'] for c in chars)
    return width < 8 and len(chars) <= 2


def group_lines(pdf_path: Path):
    raw_lines = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page_idx, page in enumerate(pdf.pages, 1):
            grouped = defaultdict(list)
            for ch in page.chars:
                grouped[round(ch['top'], 1)].append(ch)
            for top in sorted(grouped):
                chars = sorted(grouped[top], key=lambda c: c['x0'])
                text = ''.join(c['text'] for c in chars).rstrip()
                if is_ghost_blank(chars, text):
                    continue
                raw_lines.append({
                    'page': page_idx,
                    'top': top,
                    'text': canonical_text(text),
                    'chars': chars,
                    'x0': min(c['x0'] for c in chars),
                    'x1': max(c['x1'] for c in chars),
                })

    rows = []
    i = 0
    while i < len(raw_lines):
        base = raw_lines[i]
        group = [base]
        j = i + 1
        while j < len(raw_lines) and raw_lines[j]['page'] == base['page'] and abs(raw_lines[j]['top'] - base['top']) <= 1.0:
            group.append(raw_lines[j])
            j += 1
        group = sorted(group, key=lambda item: item['x0'])
        for item in group:
            item['kind'] = classify_text(item['text'], same_row_group_size=len(group))
        logical_text = ' '.join(item['text'].strip() for item in group if item['kind'] != 'blank').strip()
        rows.append({
            'page': base['page'],
            'top': round(sum(item['top'] for item in group) / len(group), 1),
            'parts': group,
            'text': logical_text,
        })
        i = j
    return rows


def estimate_line_gap(rows):
    gaps = []
    prev = None
    for row in rows:
        if prev and prev['page'] == row['page']:
            gap = row['top'] - prev['top']
            if gap > 1.5:
                gaps.append(gap)
        prev = row
    return median(gaps) if gaps else 16.0


def normalize_chord_token(token: str) -> str:
    token = token.strip()
    token = re.sub(r'^[.·•⋯…]+', '', token)
    token = re.sub(r'[.·•⋯…]+$', '', token)
    return token


def clean_chord_text(text: str) -> str:
    normalized = re.sub(r'\s+', ' ', text.strip()).replace('( ', '(').replace(' )', ')')
    parts = normalized.split()
    cleaned = []
    for part in parts:
        if part == '|':
            cleaned.append(part)
            continue
        if part == '-':
            continue
        cleaned_token = normalize_chord_token(part)
        if cleaned_token:
            cleaned.append(cleaned_token)
    return ' | '.join(cleaned) if '|' in cleaned else ' '.join(cleaned)


def build_token_positions(chord_part):
    positions = []
    text = chord_part['text']
    for match in find_chord_tokens(text):
        start, end = match.span(1)
        token_chars = chord_part['chars'][start:end]
        if not token_chars:
            continue
        positions.append({'token': match.group(1), 'x0': token_chars[0]['x0']})
    return positions


def inject(chord_row, lyric_row):
    label_parts = [part for part in lyric_row['parts'] if part['kind'] == 'label' and part['text'].strip()]
    lyric_parts = [part for part in lyric_row['parts'] if part['kind'] in {'lyric', 'other'} and part['text'].strip()]
    if not lyric_parts and not label_parts:
        return ''

    prefix = ' '.join(part['text'].strip() for part in label_parts).replace('　', ' ')
    if not lyric_parts:
        return prefix.strip()

    lyric_text = ' '.join(part['text'].strip() for part in lyric_parts).replace('　', ' ')
    anchor_chars = []
    prev_part = None
    for part in lyric_parts:
        if prev_part is not None and part['x0'] - prev_part['x1'] > 4:
            anchor_chars.append({'char': ' ', 'x0': (prev_part['x1'] + part['x0']) / 2, 'x1': (prev_part['x1'] + part['x0']) / 2})
        for ch in part['chars']:
            anchor_chars.append({'char': norm(ch['text']), 'x0': ch['x0'], 'x1': ch['x1']})
        prev_part = part

    if not anchor_chars:
        return lyric_text.strip()

    candidate_indexes = [idx for idx, anchor in enumerate(anchor_chars) if anchor['char'] != ' ']
    if not candidate_indexes:
        return lyric_text.strip()

    inserts = [[] for _ in range(len(anchor_chars) + 1)]
    last_assigned_index = -1

    for chord_part in chord_row['parts']:
        if chord_part['kind'] != 'chord':
            continue
        for item in build_token_positions(chord_part):
            token = item['token']

            best = None
            best_dist = float('inf')
            for idx in candidate_indexes:
                if idx < last_assigned_index:
                    continue
                anchor = anchor_chars[idx]
                dist = abs(anchor['x0'] - item['x0'])
                if dist < best_dist:
                    best = idx
                    best_dist = dist

            if best is None:
                best = last_assigned_index if last_assigned_index >= 0 else candidate_indexes[0]

            inserts[best].append(token)
            last_assigned_index = best

    out = []
    for idx, anchor in enumerate(anchor_chars):
        if inserts[idx]:
            out.extend(f'({token})' for token in inserts[idx])
        out.append(anchor['char'])
    if inserts[len(anchor_chars)]:
        out.extend(f'({token})' for token in inserts[len(anchor_chars)])

    rendered = ''.join(out).replace('  ', ' ').strip()
    if prefix:
        rendered = f'{prefix} {rendered}'.strip()
    return rendered


def should_skip_as_title(row, title_text: str, title_skipped: bool) -> bool:
    if title_skipped:
        return False
    row_text = row['text'].strip()
    if not row_text:
        return False
    return row_text == canonical_text(title_text).strip()


def row_kind(row):
    kinds = [part['kind'] for part in row['parts'] if part['kind'] != 'blank']
    if not kinds:
        return 'blank'
    if 'section' in kinds:
        return 'section'
    non_labels = [kind for kind in kinds if kind != 'label']
    if non_labels and all(kind == 'chord' for kind in non_labels):
        return 'chord'
    if any(kind in {'lyric', 'other', 'inline-symbol'} for kind in kinds):
        return 'lyric'
    if all(kind == 'label' for kind in kinds):
        return 'label'
    return kinds[0]


def normalize_section_label(text: str) -> str:
    normalized = canonical_text(text).strip().rstrip(':').strip()
    normalized = normalized.strip('()').strip()
    normalized = re.sub(r'\s+', ' ', normalized)
    normalized = normalized.lower()
    aliases = {
        'instrumental': 'inst',
        'ending': 'end',
    }
    return aliases.get(normalized, normalized)


def is_high_confidence_section_label(text: str) -> bool:
    return bool(HIGH_CONFIDENCE_SECTION_RE.fullmatch(normalize_section_label(text)))


def format_section_label(text: str) -> str:
    return f"***{normalize_section_label(text)}***"


def split_inline_label_and_chords(text: str):
    stripped = canonical_text(text).strip()
    candidates = [
        re.match(r'^\(([^)]+)\)\s+(.+)$', stripped),
        re.match(r'^([A-Za-z][A-Za-z0-9 _/\-]+):\s+(.+)$', stripped),
    ]
    for match in candidates:
        if not match:
            continue
        label = normalize_section_label(match.group(1))
        remainder = clean_chord_text(match.group(2))
        chord_tokens = [tok for tok in remainder.split() if tok != '|']
        if is_high_confidence_section_label(label) and chord_tokens and all(find_chord_tokens(tok) for tok in chord_tokens):
            return label, remainder
    return None


def build_body(rows, title_text: str):
    content = []
    skip_titles = {'Page 1', 'Page 2'}
    title_skipped = False
    base_gap = estimate_line_gap(rows)
    stanza_gap = max(base_gap * 1.7, base_gap + 8)
    prev_kept_row = None
    i = 0

    while i < len(rows):
        row = rows[i]
        text = row['text'].strip()
        kind = row_kind(row)

        if text in skip_titles:
            i += 1
            continue
        if should_skip_as_title(row, title_text, title_skipped):
            title_skipped = True
            i += 1
            continue
        if kind == 'blank' or not text:
            if content and content[-1] != '':
                content.append('')
            i += 1
            continue

        inline_label_and_chords = split_inline_label_and_chords(text)
        if inline_label_and_chords:
            label, chord_line = inline_label_and_chords
            if content and content[-1] != '':
                content.append('')
            content.append(format_section_label(label))
            content.append('')
            content.append(chord_line)
            prev_kept_row = row
            i += 1
            continue

        if prev_kept_row and prev_kept_row['page'] == row['page'] and row['top'] - prev_kept_row['top'] >= stanza_gap:
            if content and content[-1] != '':
                content.append('')

        if kind == 'section':
            if is_high_confidence_section_label(text):
                content.append(format_section_label(text))
                if not content or content[-1] != '':
                    content.append('')
            prev_kept_row = row
            i += 1
            continue

        if kind == 'chord':
            lyric_rows = []
            j = i + 1
            while j < len(rows):
                candidate = rows[j]
                candidate_kind = row_kind(candidate)
                if candidate['page'] != row['page']:
                    break
                if candidate_kind in {'section', 'chord'}:
                    break
                if candidate_kind == 'blank':
                    j += 1
                    continue
                if candidate['top'] - row['top'] >= stanza_gap:
                    break
                lyric_rows.append(candidate)
                j += 1

            if lyric_rows:
                target_lyric = None
                consumed_until = None
                pending_prefix = []

                for idx, lyric_candidate in enumerate(lyric_rows):
                    candidate_text = lyric_candidate['text'].strip()
                    if INLINE_SYMBOL_ONLY_RE.fullmatch(candidate_text):
                        pending_prefix.append(candidate_text)
                        continue
                    target_lyric = lyric_candidate
                    consumed_until = idx
                    break

                if target_lyric is not None:
                    injected = inject(row, target_lyric)
                    if pending_prefix:
                        injected = f"{' '.join(pending_prefix)} {injected}".strip()
                    content.append(injected)
                    for extra in lyric_rows[(consumed_until + 1 if consumed_until is not None else 1):]:
                        extra_text = ' '.join(part['text'].strip() for part in extra['parts'] if part['kind'] != 'blank').strip()
                        if extra_text:
                            content.append(extra_text)
                    prev_kept_row = lyric_rows[-1]
                    i = j
                    continue

                content.append(clean_chord_text(text))
                prev_kept_row = row
                i = j
                continue

            content.append(clean_chord_text(text))
            prev_kept_row = row
            i += 1
            continue

        content.append(text)
        prev_kept_row = row
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

    rows = group_lines(Path(args.pdf))
    body_lines = build_body(rows, args.title)

    if args.debug_json:
        debug = []
        for row in rows:
            debug.append({
                'page': row['page'],
                'top': row['top'],
                'text': row['text'],
                'kind': row_kind(row),
                'parts': [
                    {
                        'top': part['top'],
                        'x0': round(part['x0'], 1),
                        'x1': round(part['x1'], 1),
                        'text': part['text'],
                        'kind': part['kind'],
                    }
                    for part in row['parts']
                ],
            })
        debug_path = Path(args.debug_json)
        debug_path.parent.mkdir(parents=True, exist_ok=True)
        debug_path.write_text(json.dumps(debug, ensure_ascii=False, indent=2))

    md = build_md(args.title, args.artist, args.language, args.original_key, args.tags, body_lines)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(md + '\n')
    print(f'wrote {args.out}')
    print(f'processed {len(rows)} logical pdf rows via pdfplumber')


if __name__ == '__main__':
    main()
