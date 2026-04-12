import React, { useMemo } from 'react';

type Props = {
  fallbackHref: string;
  fallbackLabel: string;
};

export default function ChordFinderBackLink({ fallbackHref, fallbackLabel }: Props) {
  const { href, label } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { href: fallbackHref, label: fallbackLabel };
    }

    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const pageLabel = params.get('label');
    const st = params.get('st');
    const mode = params.get('mode');

    let href = from || fallbackHref;
    if (href && (st || mode)) {
      const url = new URL(href, window.location.origin);
      if (st) url.searchParams.set('st', st);
      if (mode) url.searchParams.set('mode', mode);
      href = url.pathname + url.search + url.hash;
    }

    return {
      href,
      label: pageLabel ? `← 返回 ${pageLabel}` : fallbackLabel,
    };
  }, [fallbackHref, fallbackLabel]);

  return (
    <a className="back-link" href={href}>
      {label}
    </a>
  );
}
