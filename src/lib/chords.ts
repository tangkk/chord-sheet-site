export type AccidentalMode = 'sharp' | 'flat';

export const CHORD_TOKEN_PATTERN = '[A-G](?:#|b)?(?:maj|min|dim|aug|m|M)?(?:(?:2|4|5|6|7|9|11|13)(?:sus(?:2|4)?)?|sus(?:2|4)?|add(?:2|4|9|11|13)|(?:[#b](?:5|9|11|13)))*(?:/[A-G](?:#|b)?)?';
const CHORD_TOKEN_REGEX = new RegExp(`^${CHORD_TOKEN_PATTERN}$`);
const BRACKETED_CHORD_REGEX = new RegExp(`\\((${CHORD_TOKEN_PATTERN})\\)`, 'g');

export function isChordToken(token: string): boolean {
  return CHORD_TOKEN_REGEX.test(token.trim());
}

const DEFAULT_SHARP_KEYS = new Set(['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m']);

export function getDefaultAccidentalMode(key: string): AccidentalMode {
  const normalized = key.trim();
  if (normalized.includes('b')) return 'flat';
  if (normalized.includes('#')) return 'sharp';
  return DEFAULT_SHARP_KEYS.has(normalized) ? 'sharp' : 'flat';
}

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

const NOTE_INDEX: Record<string, number> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

const NATURAL_NOTE_INDEX: Record<(typeof LETTERS)[number], number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const ROOT_REGEX = /^([A-G](?:#|b)?)(.*)$/;

function normalizeIndex(index: number): number {
  return ((index % 12) + 12) % 12;
}

function normalizeAccidentalOffset(offset: number): number {
  if (offset > 6) return offset - 12;
  if (offset < -6) return offset + 12;
  return offset;
}

function transposeNote(note: string, semitones: number, accidentalMode: AccidentalMode): string {
  const idx = NOTE_INDEX[note];
  if (idx === undefined) return note;
  const next = normalizeIndex(idx + semitones);
  return accidentalMode === 'flat' ? FLAT_NOTES[next] : SHARP_NOTES[next];
}

function parseChordPart(part: string): { root: string; suffix: string } | null {
  const match = part.match(ROOT_REGEX);
  if (!match) return null;
  const [, root, suffix] = match;
  return { root, suffix };
}

function letterDistance(from: string, to: string): number | null {
  const fromIndex = LETTERS.indexOf(from[0] as (typeof LETTERS)[number]);
  const toIndex = LETTERS.indexOf(to[0] as (typeof LETTERS)[number]);
  if (fromIndex === -1 || toIndex === -1) return null;
  return (toIndex - fromIndex + LETTERS.length) % LETTERS.length;
}

function spellNoteFromChordContext(targetRoot: string, originalRoot: string, originalBass: string): string | null {
  const targetRootIndex = NOTE_INDEX[targetRoot];
  const originalBassIndex = NOTE_INDEX[originalBass];
  const originalRootIndex = NOTE_INDEX[originalRoot];

  if (targetRootIndex === undefined || originalBassIndex === undefined || originalRootIndex === undefined) {
    return null;
  }

  const diatonicDistance = letterDistance(originalRoot, originalBass);
  if (diatonicDistance === null) return null;

  const targetBassIndex = normalizeIndex(targetRootIndex + (originalBassIndex - originalRootIndex));
  const targetLetterIndex = (LETTERS.indexOf(targetRoot[0] as (typeof LETTERS)[number]) + diatonicDistance) % LETTERS.length;
  const targetLetter = LETTERS[targetLetterIndex];
  const naturalIndex = NATURAL_NOTE_INDEX[targetLetter];
  const accidentalOffset = normalizeAccidentalOffset(targetBassIndex - naturalIndex);

  if (accidentalOffset < -1 || accidentalOffset > 1) {
    return null;
  }

  if (accidentalOffset === -1) return `${targetLetter}b`;
  if (accidentalOffset === 1) return `${targetLetter}#`;
  return targetLetter;
}

function transposeChordToken(token: string, semitones: number, accidentalMode: AccidentalMode): string {
  const slashParts = token.split('/');

  if (slashParts.length === 2) {
    const head = parseChordPart(slashParts[0]);
    const bass = parseChordPart(slashParts[1]);

    if (head && bass) {
      const transposedRoot = transposeNote(head.root, semitones, accidentalMode);
      const contextualBass = spellNoteFromChordContext(transposedRoot, head.root, bass.root);

      if (contextualBass) {
        return `${transposedRoot}${head.suffix}/${contextualBass}${bass.suffix}`;
      }
    }
  }

  return slashParts
    .map((part) => {
      const parsed = parseChordPart(part);
      if (!parsed) return part;
      return `${transposeNote(parsed.root, semitones, accidentalMode)}${parsed.suffix}`;
    })
    .join('/');
}

function transposeChordOnlyLine(line: string, semitones: number, accidentalMode: AccidentalMode): string {
  const trimmed = line.trim();
  if (!trimmed) return line;

  const rawParts = trimmed.split(/(\|)/).map((part) => part.trim()).filter((part) => part !== '');
  const chordOnlyCandidates = rawParts.filter((part) => part !== '|').flatMap((part) => part.split(/\s+/)).filter(Boolean);
  const isChordOnly =
    chordOnlyCandidates.length > 0 &&
    chordOnlyCandidates.every((token) => isChordToken(token));

  if (!isChordOnly) return line;

  return rawParts
    .map((part) => {
      if (part === '|') return '|';
      return part
        .split(/\s+/)
        .filter(Boolean)
        .map((token) => transposeChordToken(token, semitones, accidentalMode))
        .join(' ');
    })
    .join(' ')
    .replace(/\s+\|\s+/g, ' | ')
    .trim();
}

export function transposeChordText(input: string, semitones: number, accidentalMode: AccidentalMode = 'sharp'): string {
  return input
    .split(/\r?\n/)
    .map((line) => {
      if (BRACKETED_CHORD_REGEX.test(line)) {
        BRACKETED_CHORD_REGEX.lastIndex = 0;
        return line.replace(BRACKETED_CHORD_REGEX, (_, chord: string) => `(${transposeChordToken(chord.trim(), semitones, accidentalMode)})`);
      }
      BRACKETED_CHORD_REGEX.lastIndex = 0;
      return transposeChordOnlyLine(line, semitones, accidentalMode);
    })
    .join('\n');
}

export function transposeKey(key: string, semitones: number, accidentalMode: AccidentalMode = 'sharp'): string {
  return transposeChordToken(key, semitones, accidentalMode);
}

export function semitoneDistance(fromKey: string, toKey: string): number {
  const fromMatch = fromKey.trim().match(ROOT_REGEX);
  const toMatch = toKey.trim().match(ROOT_REGEX);
  if (!fromMatch || !toMatch) return 0;
  const fromIdx = NOTE_INDEX[fromMatch[1]];
  const toIdx = NOTE_INDEX[toMatch[1]];
  if (fromIdx === undefined || toIdx === undefined) return 0;
  return normalizeIndex(toIdx - fromIdx);
}
