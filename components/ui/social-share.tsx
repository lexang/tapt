'use client';

import { useEffect, useState } from 'react';

type SocialShareProps = {
  mode?: 'compact' | 'full';
};

const SHARE_TEXT = '在线表格格式转换器，6 种格式互转，浏览器内完成。';

function buildLinks(currentUrl: string) {
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
  };
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 3.56H5.051z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1" />
    </svg>
  );
}

export function SocialShare({ mode = 'full' }: SocialShareProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const links = buildLinks(currentUrl);

  function open(url: string) {
    window.open(url, '_blank', 'width=600,height=500,noopener,noreferrer');
  }

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  if (mode === 'compact') {
    return (
      <div className="header-share-menu" role="menu">
        <button type="button" onClick={() => open(links.twitter)} role="menuitem">
          <TwitterIcon />
          <span>X (Twitter)</span>
        </button>
        <button type="button" onClick={() => open(links.facebook)} role="menuitem">
          <FacebookIcon />
          <span>Facebook</span>
        </button>
        <button type="button" onClick={() => open(links.linkedin)} role="menuitem">
          <LinkedInIcon />
          <span>LinkedIn</span>
        </button>
        <button type="button" onClick={copyLink} role="menuitem">
          <LinkIcon />
          <span>{copied ? '已复制链接' : '复制链接'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="share-buttons-full">
      <button type="button" onClick={() => open(links.twitter)} title="分享到 X/Twitter">
        <TwitterIcon />
        <span>X (Twitter)</span>
      </button>
      <button type="button" onClick={() => open(links.facebook)} title="分享到 Facebook">
        <FacebookIcon />
        <span>Facebook</span>
      </button>
      <button type="button" onClick={() => open(links.linkedin)} title="分享到 LinkedIn">
        <LinkedInIcon />
        <span>LinkedIn</span>
      </button>
      <button type="button" onClick={copyLink} title="复制链接">
        <LinkIcon />
        <span>{copied ? '已复制' : '复制链接'}</span>
      </button>
    </div>
  );
}
