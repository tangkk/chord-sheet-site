export type AccidentalMode = 'sharp' | 'flat';

const DEFAULT_SHARP_KEYS = new Set(['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m']);

export function getDefaultAccidentalMode(key: string): AccidentalMode {
  const normalized = key.trim();
  if (normalized.includes('b')) return 'flat';
  if (normalized.includes('#')) return 'sharp';
  return DEFAULT_SHARP_KEYS.has(normalized) ? 'sharp' : 'flat';
}

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

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

const ROOT_REGEX = /^([A-G](?:#|b)?)(.*)$/;

function normalizeIndex(index: number): number {
  return ((index % 12) + 12) % 12;
}

function transposeNote(note: string, semitones: number, accidentalMode: AccidentalMode): string {
  const idx = NOTE_INDEX[note];
  if (idx === undefined) return note;
  const next = normalizeIndex(idx + semitones);
  return accidentalMode === 'flat' ? FLAT_NOTES[next] : SHARP_NOTES[next];
}

function transposeChordToken(token: string, semitones: number, accidentalMode: AccidentalMode): string {
  const slashParts = token.split('/');
  return slashParts
    .map((part) => {
      const match = part.match(ROOT_REGEX);
      if (!match) return part;
      const [, root, suffix] = match;
      return `${transposeNote(root, semitones, accidentalMode)}${suffix}`;
    })
    .join('/');
}

export function transposeChordText(input: string, semitones: number, accidentalMode: AccidentalMode = 'sharp'): string {
  return input.replace(/\(([^)]+)\)/g, (_, chord: string) => `(${transposeChordToken(chord.trim(), semitones, accidentalMode)})`);
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
