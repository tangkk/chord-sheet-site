import React from 'react';

type Props = {
  hrefBase: string;
  label: string;
  fallbackKey: string;
};

export default function SongChordFinderLink({ hrefBase, label, fallbackKey }: Props) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === 'undefined') return;
    event.preventDefault();
    const keyText = document.querySelector<HTMLElement>('.toolbar-key-value')?.textContent?.trim() || fallbackKey;
    const semitonesText = document.querySelector<HTMLElement>('.toolbar-semitones')?.textContent?.trim() || '0';
    const modeText = document.querySelector<HTMLElement>('.toolbar-accidental-mode')?.textContent?.trim() || 'flat';
    const nextHref = `${hrefBase}&key=${encodeURIComponent(keyText)}&st=${encodeURIComponent(semitonesText)}&mode=${encodeURIComponent(modeText)}`;
    window.location.href = nextHref;
  };

  return (
    <a href={`${hrefBase}&key=${encodeURIComponent(fallbackKey)}`} className="hero-link" onClick={handleClick}>
      {label}
    </a>
  );
}
