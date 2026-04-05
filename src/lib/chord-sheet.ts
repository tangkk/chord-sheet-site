export type ParsedSegment = {
  chord: string | null;
  lyric: string;
};

export type ParsedLine = ParsedSegment[];

export function parseChordLine(line: string): ParsedLine {
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

  return segments;
}

export function parseChordSheet(text: string): ParsedLine[] {
  return text.split(/\r?\n/).map(parseChordLine);
}
