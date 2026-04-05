export type ParsedSegment = {
  chord: string | null;
  lyric: string;
};

export type ParsedLine =
  | { type: 'blank' }
  | { type: 'section'; text: string }
  | { type: 'alt'; text: string }
  | { type: 'chords-only'; chords: string[] }
  | { type: 'segments'; segments: ParsedSegment[] };

export function parseChordLine(line: string): ParsedLine {
  const trimmed = line.trim();

  if (trimmed === '') {
    return { type: 'blank' };
  }

  if (/^\[alt\]\s+/i.test(trimmed)) {
    return { type: 'alt', text: trimmed.replace(/^\[alt\]\s+/i, '') };
  }

  if (/^[A-Za-z0-9 _-]+:$/.test(trimmed)) {
    return { type: 'section', text: trimmed.slice(0, -1) };
  }

  const chordOnlyCandidates = trimmed.split('|').flatMap((part) => part.trim().split(/\s+/)).filter(Boolean);
  const isChordOnly =
    chordOnlyCandidates.length > 0 &&
    chordOnlyCandidates.every((token) => /^[A-G](?:#|b)?(?:[^\s|]*)$/.test(token));

  if (isChordOnly) {
    return { type: 'chords-only', chords: chordOnlyCandidates };
  }
  const segments: ParsedSegment[] = [];
  const regex = /\(([^)]+)\)/g;
  let lastIndex = 0;
  let pendingChord: string | null = null;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const lyricBefore = line.slice(lastIndex, match.index);
    if (lyricBefore) {
      segments.push({ chord: pendingChord, lyric: lyricBefore });
      pendingChord = null;
    }

    pendingChord = match[1].trim();
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
    return { type: 'chords-only', chords: segments.map((segment) => segment.chord!).filter(Boolean) };
  }

  return { type: 'segments', segments };
}

export function parseChordSheet(text: string): ParsedLine[] {
  return text.split(/\r?\n/).map(parseChordLine);
}
