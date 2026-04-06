import { isChordToken, transposeKey, type AccidentalMode } from './chords';

export type ParsedSegment = {
  chord: string | null;
  lyric: string;
};

export type ChordOnlyToken =
  | { type: 'chord'; value: string }
  | { type: 'bar' };

export type ParsedLine =
  | { type: 'blank' }
  | { type: 'section'; text: string }
  | { type: 'alt'; text: string }
  | { type: 'chords-only'; tokens: ChordOnlyToken[] }
  | { type: 'segments'; segments: ParsedSegment[] };

export function parseChordLine(line: string): ParsedLine {
  const trimmed = line.trim();

  if (trimmed === '') {
    return { type: 'blank' };
  }

  if (/^\[alt\]\s+/i.test(trimmed)) {
    return { type: 'alt', text: trimmed.replace(/^\[alt\]\s+/i, '') };
  }

  const emphasizedSectionMatch = trimmed.match(/^\*\*\*\s*([^*][^*]*?)\s*\*\*\*$/);
  if (emphasizedSectionMatch) {
    return { type: 'section', text: emphasizedSectionMatch[1].trim() };
  }

  if (/^[A-Za-z0-9 _-]+:$/.test(trimmed)) {
    return { type: 'section', text: trimmed.slice(0, -1) };
  }

  const inlineLabelMatch = trimmed.match(/^\(([^)]+)\)\s+(.+)$/) ?? trimmed.match(/^([A-Za-z][A-Za-z0-9 _/-]+):\s+(.+)$/);
  if (inlineLabelMatch) {
    const sectionName = inlineLabelMatch[1].trim().toLowerCase();
    if (['inst', 'instrumental', 'end', 'ending', 'intro', 'outro', 'solo', 'interlude'].includes(sectionName)) {
      return { type: 'section', text: sectionName === 'instrumental' ? 'inst' : sectionName === 'ending' ? 'end' : sectionName };
    }
  }

  const rawParts = trimmed.split(/(\|)/).map((part) => part.trim()).filter((part) => part !== '');
  const chordOnlyCandidates = rawParts.filter((part) => part !== '|').flatMap((part) => part.split(/\s+/)).filter(Boolean);
  const isChordOnly =
    chordOnlyCandidates.length > 0 &&
    chordOnlyCandidates.every((token) => isChordToken(token));

  if (isChordOnly) {
    const tokens: ChordOnlyToken[] = [];

    for (const part of rawParts) {
      if (part === '|') {
        tokens.push({ type: 'bar' });
        continue;
      }

      for (const chord of part.split(/\s+/).filter(Boolean)) {
        tokens.push({ type: 'chord', value: chord });
      }
    }

    return { type: 'chords-only', tokens };
  }
  const segments: ParsedSegment[] = [];
  const regex = /\(([^)]+)\)/g;
  let lastIndex = 0;
  let pendingChord: string | null = null;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const lyricBefore = line.slice(lastIndex, match.index);
    const bracketContent = match[1].trim();

    if (!isChordToken(bracketContent)) {
      continue;
    }

    if (lyricBefore) {
      segments.push({ chord: pendingChord, lyric: lyricBefore });
      pendingChord = null;
    }

    pendingChord = bracketContent;
    lastIndex = regex.lastIndex;
  }

  const tail = line.slice(lastIndex);
  if (tail || pendingChord) {
    segments.push({ chord: pendingChord, lyric: tail });
  }

  if (segments.length === 0) {
    segments.push({ chord: null, lyric: line });
  }

  const allWhitespaceLyrics = segments.every((segment) => segment.lyric.trim() === '');
  const allHaveChords = segments.every((segment) => segment.chord && segment.chord.trim() !== '');

  if (allWhitespaceLyrics && allHaveChords) {
    return {
      type: 'chords-only',
      tokens: segments.map((segment) => ({ type: 'chord' as const, value: segment.chord! })).filter(Boolean),
    };
  }

  return { type: 'segments', segments };
}

export function parseChordSheet(text: string, semitones = 0, accidentalMode: AccidentalMode = 'flat'): ParsedLine[] {
  return text
    .split(/\r?\n/)
    .map(parseChordLine)
    .map((line) => {
      if (line.type !== 'chords-only' || semitones === 0) return line;
      return {
        ...line,
        tokens: line.tokens.map((token) =>
          token.type === 'chord'
            ? { type: 'chord' as const, value: transposeKey(token.value, semitones, accidentalMode) }
            : token,
        ),
      };
    });
}
