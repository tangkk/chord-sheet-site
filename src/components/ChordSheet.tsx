import React, { useMemo, useState } from 'react';
import { parseChordSheet } from '../lib/chord-sheet';
import { transposeChordText, transposeKey, type AccidentalMode } from '../lib/chords';

type Props = {
  text: string;
  originalKey: string;
  capo?: number;
};

export default function ChordSheet({ text, originalKey, capo }: Props) {
  const [semitones, setSemitones] = useState(0);
  const [accidentalMode, setAccidentalMode] = useState<AccidentalMode>('flat');

  const renderedText = useMemo(
    () => transposeChordText(text, semitones, accidentalMode),
    [text, semitones, accidentalMode],
  );

  const parsed = useMemo(() => parseChordSheet(renderedText), [renderedText]);
  const displayKey = useMemo(
    () => transposeKey(originalKey, semitones, accidentalMode),
    [originalKey, semitones, accidentalMode],
  );

  return (
    <section className="chord-sheet-card">
      <div className="floating-toolbar" aria-label="Transpose controls">
        <button type="button" onClick={() => setSemitones((v) => v + 1)}>+</button>
        <button type="button" onClick={() => setSemitones(0)}>0</button>
        <button type="button" onClick={() => setSemitones((v) => v - 1)}>-</button>
        <button type="button" onClick={() => setAccidentalMode((mode) => (mode === 'flat' ? 'sharp' : 'flat'))}>
          {accidentalMode === 'flat' ? '♭' : '♯'}
        </button>
      </div>

      <div className="sheet">
        {parsed.map((line, lineIndex) => {
          if (line.type === 'blank') {
            return <div key={lineIndex} className="line blank" />;
          }

          if (line.type === 'section') {
            return (
              <div key={lineIndex} className="section-line">
                {line.text}
              </div>
            );
          }

          if (line.type === 'alt') {
            return (
              <div key={lineIndex} className="alt-line">
                [alt] {line.text}
              </div>
            );
          }

          if (line.type === 'chords-only') {
            return (
              <div key={lineIndex} className="chords-only-line">
                {line.tokens.map((token, chordIndex) =>
                  token.type === 'bar' ? (
                    <span key={`${lineIndex}-${chordIndex}`} className="chords-only-bar" aria-hidden="true">
                      |
                    </span>
                  ) : (
                    <span key={`${lineIndex}-${chordIndex}`} className="chords-only-chip">
                      {token.value}
                    </span>
                  ),
                )}
              </div>
            );
          }

          return (
            <div key={lineIndex} className="line">
              {line.segments.map((segment, segmentIndex) => {
                const chordLength = (segment.chord ?? '').length;
                const lyricLength = segment.lyric.trim().length;
                const compactNeedsBoost = chordLength >= 6 && lyricLength <= 2;
                return (
                  <span
                    key={`${lineIndex}-${segmentIndex}`}
                    className={`segment${compactNeedsBoost ? ' dense-short' : ''}`}
                    style={compactNeedsBoost ? { minWidth: `${Math.max(5.4, chordLength * 0.9)}rem` } : undefined}
                  >
                    <span className="chord">{segment.chord ?? '\u00A0'}</span>
                    <span className={`lyric${segment.lyric === '' ? ' spacer' : ''}`}>{segment.lyric || '\u00A0'}</span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
