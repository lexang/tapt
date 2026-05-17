'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SocialShare } from '@/components/ui/social-share';

export function GlobalHeader() {
  const [shareOpen, setShareOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!shareOpen) {
      return;
    }
    function onClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setShareOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShareOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [shareOpen]);

  return (
    <header className="global-header">
      <div className="header-container">
        <Link href="/zh" className="header-logo">
          <span className="brand-mark">T</span>
          <strong>TableConvert</strong>
        </Link>
        <div className="header-right">
          <nav className="header-nav" aria-label="主导航">
            <Link href="/zh">首页</Link>
            {/* TODO: replace with real repository URL when published */}
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </nav>
          <div className="header-share" ref={wrapRef}>
            <button
              type="button"
              className="header-share-trigger"
              aria-haspopup="menu"
              aria-expanded={shareOpen}
              onClick={() => setShareOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>分享</span>
              <svg className="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {shareOpen ? <SocialShare mode="compact" /> : null}
          </div>
        </div>
      </div>
    </header>
  );
}
