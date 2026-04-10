import React from 'react';

type Props = {
  fret: string;
  name: string;
};

type ParsedPosition = {
  type: 'mute' | 'open' | 'fret';
  fret?: number;
};

type Barre = {
  fret: number;
  from: number;
  to: number;
};

function parseFretChar(char: string): ParsedPosition {
  if (char === 'x' || char === 'X') return { type: 'mute' };
  const num = Number(char);
  if (Number.isNaN(num)) return { type: 'mute' };
  if (num === 0) return { type: 'open' };
  return { type: 'fret', fret: num };
}

function detectBarres(positions: ParsedPosition[]): Barre[] {
  const byFret = new Map<number, number[]>();

  positions.forEach((pos, stringIndex) => {
    if (pos.type !== 'fret' || !pos.fret) return;
    const arr = byFret.get(pos.fret) ?? [];
    arr.push(stringIndex);
    byFret.set(pos.fret, arr);
  });

  const barres: Barre[] = [];

  for (const [fret, strings] of byFret.entries()) {
    if (strings.length < 2) continue;
    const sorted = [...strings].sort((a, b) => a - b);
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i <= sorted.length; i += 1) {
      const current = sorted[i];
      if (current === prev + 1) {
        prev = current;
        continue;
      }

      if (prev - start >= 1) {
        barres.push({ fret, from: start, to: prev });
      }

      start = current;
      prev = current;
    }
  }

  return barres;
}

const STRING_COUNT = 6;
const FRET_COUNT = 5;
const WIDTH = 84;
const HEIGHT = 110;
const PADDING_X = 10;
const TOP_MARKS_Y = 10;
const GRID_TOP = 26;
const GRID_BOTTOM = 106;
const STRING_SPACING = (WIDTH - PADDING_X * 2) / (STRING_COUNT - 1);
const FRET_SPACING = (GRID_BOTTOM - GRID_TOP) / FRET_COUNT;

function stringX(index: number): number {
  return PADDING_X + index * STRING_SPACING;
}

function fretY(lineIndex: number): number {
  return GRID_TOP + lineIndex * FRET_SPACING;
}

function dotY(fret: number, baseFret: number): number {
  const row = fret - baseFret;
  return fretY(row) + FRET_SPACING / 2;
}

function tokenizeFretInput(fret: string): string[] {
  const trimmed = fret.trim();
  if (trimmed.includes('-')) {
    return trimmed.split('-').map((part) => part.trim()).filter(Boolean).slice(0, 6);
  }
  return trimmed.split('').slice(0, 6);
}

export default function ChordDiagram({ fret, name }: Props) {
  const tokens = tokenizeFretInput(fret);
  const positions = Array.from({ length: 6 }, (_, index) => parseFretChar(tokens[index] ?? 'x'));
  const fretted = positions.filter((item) => item.type === 'fret').map((item) => item.fret as number);
  const minFret = fretted.length ? Math.min(...fretted) : 1;
  const baseFret = minFret >= 2 ? minFret : 1;
  const barres = detectBarres(positions);

  return (
    <div className="chord-diagram" aria-label={`${name} chord diagram`}>
      <div className="chord-diagram-top">
        <span className="chord-diagram-name">{name}</span>
        {baseFret > 1 ? <span className="chord-diagram-base-fret">{baseFret}fr</span> : null}
      </div>

      <svg className="chord-diagram-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-hidden="true">
        {positions.map((pos, i) => (
          <text key={`head-${i}`} x={stringX(i)} y={TOP_MARKS_Y} textAnchor="middle" className="chord-diagram-head-text">
            {pos.type === 'mute' ? '×' : pos.type === 'open' ? '○' : ''}
          </text>
        ))}

        {Array.from({ length: STRING_COUNT }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={stringX(i)}
            y1={GRID_TOP}
            x2={stringX(i)}
            y2={GRID_BOTTOM}
            className="chord-diagram-string"
          />
        ))}

        {Array.from({ length: FRET_COUNT + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={stringX(0)}
            y1={fretY(i)}
            x2={stringX(STRING_COUNT - 1)}
            y2={fretY(i)}
            className={i === 0 && baseFret === 1 ? 'chord-diagram-fret chord-diagram-nut' : 'chord-diagram-fret'}
          />
        ))}

        {barres.map((barre) => (
          <line
            key={`barre-${barre.fret}-${barre.from}-${barre.to}`}
            x1={stringX(barre.from)}
            y1={dotY(barre.fret, baseFret)}
            x2={stringX(barre.to)}
            y2={dotY(barre.fret, baseFret)}
            className="chord-diagram-barre"
          />
        ))}

        {positions.map((pos, i) => {
          if (pos.type !== 'fret' || !pos.fret) return null;
          const coveredByBarre = barres.some((barre) => barre.fret === pos.fret && i >= barre.from && i <= barre.to);
          if (coveredByBarre) return null;

          return (
            <circle
              key={`dot-${i}-${pos.fret}`}
              cx={stringX(i)}
              cy={dotY(pos.fret, baseFret)}
              r="4.8"
              className="chord-diagram-dot"
            />
          );
        })}
      </svg>
    </div>
  );
}
