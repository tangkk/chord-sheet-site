import { getDefaultAccidentalMode, semitoneDistance, transposeKey } from './chords';
import { resolveChordQueryName } from './chord-finder';

const BASE_KEY = 'C';
const BASE_SUGGESTIONS = ['C', 'Am', 'F', 'G', 'Cmaj7', 'Dm7', 'G7', 'Bm7b5', 'F#m7b5'];

export function getChordFinderDefaultKey(): string {
  if (typeof window === 'undefined') return BASE_KEY;
  const params = new URLSearchParams(window.location.search);
  return params.get('key') || BASE_KEY;
}

export function getChordFinderSuggestions(targetKey: string): string[] {
  const distance = semitoneDistance(BASE_KEY, targetKey);
  const accidentalMode = getDefaultAccidentalMode(targetKey);
  return BASE_SUGGESTIONS.map((item) => resolveChordQueryName(transposeKey(item, distance, accidentalMode)));
}
