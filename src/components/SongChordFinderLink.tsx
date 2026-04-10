import React, { useMemo } from 'react';

type Props = {
  hrefBase: string;
  label: string;
  fallbackKey: string;
};

export default function SongChordFinderLink({ hrefBase, label, fallbackKey }: Props) {
  const href = useMemo(() => {
    if (typeof window === 'undefined') {
      return `${hrefBase}&key=${encodeURIComponent(fallbackKey)}`;
    }

    const keyText = document.querySelector<HTMLElement>('.toolbar-key-value')?.textContent?.trim() || fallbackKey;
    return `${hrefBase}&key=${encodeURIComponent(keyText)}`;
  }, [hrefBase, fallbackKey]);

  return (
    <a href={href} className="hero-link">
      {label}
    </a>
  );
}
