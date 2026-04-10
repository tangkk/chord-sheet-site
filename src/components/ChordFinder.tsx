import React, { useMemo, useState } from 'react';
import ChordDiagram from './ChordDiagram';
import { findChordVoicings, getDiagramFret, getDisplayFret } from '../lib/chord-finder';

const SUGGESTIONS = ['C', 'Am', 'F', 'G', 'Cmaj7', 'Dm7', 'G7', 'Bm7b5', 'F#m7b5'];

export default function ChordFinder() {
  const [query, setQuery] = useState('C');
  const results = useMemo(() => findChordVoicings(query), [query]);

  return (
    <section className="card chord-finder-card">
      <div className="chord-finder-head">
        <h1 className="song-title chord-finder-title">Chord Finder</h1>
        <p className="home-section-meta">输一个 chord 名，查常用吉他按法。</p>
      </div>

      <div className="chord-finder-input-row">
        <input
          className="chord-finder-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例如 Cmaj7 / F#m / Bb"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      <div className="chord-finder-suggestions">
        {SUGGESTIONS.map((item) => (
          <button key={item} type="button" className="chord-pill" onClick={() => setQuery(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="chord-finder-results">
        {query.trim() === '' ? (
          <p className="home-section-meta">先输入一个 chord。</p>
        ) : results.length === 0 ? (
          <p className="home-section-meta">暂时没收录这个 chord 的常用指法。</p>
        ) : (
          results.map((item) => (
            <article key={`${item.name}-${item.fret}`} className="chord-result-row">
              <div className="chord-result-main">
                <ChordDiagram fret={getDiagramFret(item.fret)} name={item.name} />
                <div className="chord-result-copy">
                  <div className="chord-result-name">{item.name}</div>
                  <div className="chord-result-fret">{getDisplayFret(item.fret)}</div>
                  {item.notes?.length ? <div className="chord-result-notes">{item.notes.join(' · ')}</div> : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
