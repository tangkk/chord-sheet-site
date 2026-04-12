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
    window.location.href = `${hrefBase}&key=${encodeURIComponent(keyText)}`;
  };

  return (
    <a href={`${hrefBase}&key=${encodeURIComponent(fallbackKey)}`} className="hero-link" onClick={handleClick}>
      {label}
    </a>
  );
}
