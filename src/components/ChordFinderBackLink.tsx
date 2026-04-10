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

    return {
      href: from || fallbackHref,
      label: pageLabel ? `← 返回 ${pageLabel}` : fallbackLabel,
    };
  }, [fallbackHref, fallbackLabel]);

  return (
    <a className="back-link" href={href}>
      {label}
    </a>
  );
}
