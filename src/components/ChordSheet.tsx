import React, { useMemo, useState } from 'react';
import { parseChordSheet } from '../lib/chord-sheet';
import { getDefaultAccidentalMode, semitoneDistance, transposeChordText, transposeKey, type AccidentalMode } from '../lib/chords';

type Props = {
  text: string;
  originalKey: string;
  sourceKey?: string;
  capo?: number;
};

export default function ChordSheet({ text, originalKey, sourceKey, capo }: Props) {
  const baseSemitones = useMemo(() => (sourceKey ? semitoneDistance(sourceKey, originalKey) : 0), [sourceKey, originalKey]);
  const [semitones, setSemitones] = useState(0);
  const [accidentalMode, setAccidentalMode] = useState<AccidentalMode>(() => getDefaultAccidentalMode(originalKey));

  const activeSemitones = baseSemitones + semitones;

  const renderedText = useMemo(
    () => transposeChordText(text, activeSemitones, accidentalMode),
    [text, activeSemitones, accidentalMode],
  );

  const parsed = useMemo(() => parseChordSheet(renderedText, activeSemitones, accidentalMode), [renderedText, activeSemitones, accidentalMode]);
  const displayKey = useMemo(
    () => transposeKey(originalKey, semitones, accidentalMode),
    [originalKey, semitones, accidentalMode],
  );

  return (
    <section className="chord-sheet-card">
      <div className="toolbar" aria-label="Transpose controls">
        <div className="toolbar-group toolbar-readout">
          <span className="toolbar-key-value">{displayKey}</span>
          <span className="toolbar-key-origin">原调 {originalKey}</span>
        </div>
        <div className="toolbar-group toolbar-buttons">
          <button type="button" onClick={() => setSemitones((v) => v - 1)}>-</button>
          <button type="button" onClick={() => setSemitones(0)}>{semitones}</button>
          <button type="button" onClick={() => setSemitones((v) => v + 1)}>+</button>
          <button type="button" onClick={() => setAccidentalMode((mode) => (mode === 'flat' ? 'sharp' : 'flat'))}>
            {accidentalMode === 'flat' ? '♭' : '♯'}
          </button>
        </div>
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

          const longLine = line.segments.map((segment) => segment.lyric).join('').replace(/\s+/g, '').length >= 18;

          return (
            <div key={lineIndex} className={`line${longLine ? ' mobile-reading-line' : ''}`}>
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
