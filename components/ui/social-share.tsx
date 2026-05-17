import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function SocialShare() {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const shareText = '我发现了一个超级好用的全能表格转换工具，支持 Excel、JSON、CSV、Markdown 等数十种格式无缝互转，全本地化处理速度极快且绝对安全！';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>分享：</span>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => window.open(shareLinks.twitter, '_blank', 'width=600,height=400')}
        style={{ padding: '0 8px', color: '#1DA1F2' }}
        title="分享到 X/Twitter"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 3.56H5.051z"/>
        </svg>
      </Button>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => window.open(shareLinks.facebook, '_blank', 'width=600,height=400')}
        style={{ padding: '0 8px', color: '#1877F2' }}
        title="分享到 Facebook"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </Button>
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => window.open(shareLinks.linkedin, '_blank', 'width=600,height=400')}
        style={{ padding: '0 8px', color: '#0A66C2' }}
        title="分享到 LinkedIn"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </Button>
    </div>
  );
}
