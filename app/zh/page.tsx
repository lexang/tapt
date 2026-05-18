import { ConverterWorkbench } from '@/components/workbench/converter-workbench';
import { FeaturesSection } from '@/components/seo/features-section';
import { HowToUseSection } from '@/components/seo/how-to-use-section';
import { FaqSection } from '@/components/seo/faq-section';
import { SocialProofSection } from '@/components/seo/social-proof-section';
import { MatrixLinksSection } from '@/components/seo/matrix-links-section';
import { ShareBanner } from '@/components/seo/share-banner';
import { HeroSection } from '@/components/home/hero-section';

export const metadata = {
  title: '表格转换工具 - 免费在线表格转换器',
  description: '在线转换 Excel、CSV、JSON、Markdown、SQL 和 HTML 表格数据。全本地化运行，快速且安全。',
  alternates: {
    canonical: '/zh',
  },
  openGraph: {
    title: '表格转换工具 - 免费在线表格转换器',
    description: '在线转换 Excel、CSV、JSON、Markdown、SQL 和 HTML 表格数据。全本地化运行，快速且安全。',
    url: '/zh',
    type: 'website',
  },
  twitter: {
    title: '表格转换工具 - 免费在线表格转换器',
    description: '在线转换 Excel、CSV、JSON、Markdown、SQL 和 HTML 表格数据。',
  },
};

export default function ZhHomePage() {
  return (
    <main className="page-shell">
      <HeroSection />

      <ConverterWorkbench initialConverterId="excel-to-json" />

      <SocialProofSection />

      <FeaturesSection />

      <HowToUseSection />

      <MatrixLinksSection />

      <FaqSection />

      <ShareBanner />
    </main>
  );
}
