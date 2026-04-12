export const CANONICAL_CHORD_ROOTS = ['C', 'Db', 'D', 'Eb', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export const NOTE_INDEX: Record<string, number> = {
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

export function canonicalizeChordRoot(note: string): string {
  const idx = NOTE_INDEX[note];
  if (idx === undefined) return note;
  return CANONICAL_CHORD_ROOTS[idx] ?? note;
}

export function toCanonicalChordName(name: string): string {
  const match = name.trim().match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return name;
  const [, root, suffix] = match;
  return `${canonicalizeChordRoot(root)}${suffix}`;
}
