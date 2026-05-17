import { SocialShare } from '@/components/ui/social-share';

export function ShareBanner() {
  return (
    <section className="share-banner" aria-label="分享">
      <p className="share-banner-title">觉得好用？把它分享给同样需要的朋友。</p>
      <p className="share-banner-sub">一个链接，6 种主流表格格式互转，全程在浏览器内完成。</p>
      <SocialShare mode="full" />
    </section>
  );
}
