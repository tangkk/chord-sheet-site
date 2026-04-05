#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function slugify(input) {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function isSectionLine(line) {
  return /^(intro|verse(?:\s*\d+)?|prechorus|chorus|bridge|instrumental|outro|to\s+[a-z0-9 _-]+)\s*:$/i.test(line.trim());
}

function isChordToken(token) {
  return /^[A-G](?:#|b)?(?:[^\s|]*)$/.test(token);
}

function convertChordMarkerPair(chordLine, lyricLine) {
  const chords = chordLine.trim().split(/\s+/).filter(Boolean);
  const markers = [...lyricLine.matchAll(/\(([^)]*)\)/g)];

  if (markers.length === 0) {
    return { line: lyricLine, warnings: [`No markers found for chord line: ${chordLine}`] };
  }

  if (chords.length !== markers.length) {
    return {
      line: `${chordLine}\n${lyricLine}`,
      warnings: [`Chord count (${chords.length}) does not match marker count (${markers.length}) for lyric line: ${lyricLine}`],
    };
  }

  let result = '';
  let lastIndex = 0;

  markers.forEach((match, index) => {
    const markerText = match[1];
    const markerStart = match.index;
    const markerEnd = markerStart + match[0].length;
    result += lyricLine.slice(lastIndex, markerStart);
    result += `(${chords[index]} )${markerText}`;
    lastIndex = markerEnd;
  });

  result += lyricLine.slice(lastIndex);
  result = result.replace(/\(([A-G][^)]+?) \)/g, '( $1 )');
  return { line: result, warnings: [] };
}

function normalizeBody(raw) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const warnings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const trimmed = line.trim();

    if (trimmed === '') {
      out.push('');
      continue;
    }

    if (isSectionLine(trimmed)) {
      out.push(trimmed.toLowerCase());
      out.push('');
      continue;
    }

    const next = lines[i + 1]?.trimEnd() ?? '';
    const nextTrimmed = next.trim();
    const chordTokens = trimmed.split(/\s+/).filter(Boolean);
    const isChordOnlyLine = chordTokens.length > 0 && trimmed.includes('|') && chordTokens.filter((t) => t !== '|').every((t) => isChordToken(t));
    const isChordMarkerPair = chordTokens.length > 0 && chordTokens.every((t) => isChordToken(t)) && /\([^)]*\)/.test(nextTrimmed);

    if (isChordOnlyLine) {
      out.push(trimmed);
      continue;
    }

    if (isChordMarkerPair) {
      const { line: converted, warnings: pairWarnings } = convertChordMarkerPair(trimmed, nextTrimmed);
      out.push(converted);
      warnings.push(...pairWarnings);
      i += 1;
      continue;
    }

    const altMatch = trimmed.match(/^(.*)\s+\[([^\]]+)\]\s*$/);
    if (altMatch) {
      out.push(altMatch[1].trimEnd());
      out.push(`[alt] ${altMatch[2].trim()}`);
      continue;
    }

    out.push(trimmed);
  }

  return { body: out.join('\n').replace(/\n{3,}/g, '\n\n').trim(), warnings };
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node scripts/normalize-chord-sheet.mjs <input.txt> [title] [artist] [originalKey]');
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const title = process.argv[3] || path.basename(inputPath, path.extname(inputPath));
  const artist = process.argv[4] || '待补充';
  const originalKey = process.argv[5] || '待补充';
  const language = 'yue';
  const slug = slugify(title) || 'untitled';

  const { body, warnings } = normalizeBody(raw);

  const output = `---\ntitle: ${title}\nartist: ${artist}\nlanguage: ${language}\noriginalKey: ${originalKey}\ncapo: 0\ntags:\n  - 粤语\n  - 流行\n  - ${artist}\n---\n\n${body}\n`;

  process.stdout.write(output);

  if (warnings.length > 0) {
    process.stderr.write(`\n\nWarnings:\n- ${warnings.join('\n- ')}\n`);
  }

  process.stderr.write(`\nOutput slug suggestion: ${slug}\n`);
}

main();
