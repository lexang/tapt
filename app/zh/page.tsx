import Link from 'next/link';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';
import { converterPages } from '@/content/converters';
import { FeaturesSection } from '@/components/seo/features-section';
import { HowToUseSection } from '@/components/seo/how-to-use-section';
import { FaqSection } from '@/components/seo/faq-section';
import { SocialProofSection } from '@/components/seo/social-proof-section';

export const metadata = {
  title: '表格转换工具 - 免费在线表格转换器',
  description: '在线转换 Excel、CSV、JSON、Markdown、SQL 和 HTML 表格数据。全本地化运行，快速且安全。',
};

export default function ZhHomePage() {
  return (
    <main className="page-shell">
      <section className="hero-section">
        <h1 className="hero-title">免费在线表格转换器</h1>
        <p className="hero-subtitle">粘贴、上传您的表格数据，轻松且安全地转换为 Excel、JSON、CSV、SQL 等数十种格式。</p>
      </section>

      <ConverterWorkbench initialConverterId="excel-to-json" />

      <SocialProofSection />
      
      <FeaturesSection />

      <HowToUseSection />

      <section className="content-section" aria-labelledby="popular-converters">
        <h2 id="popular-converters">常用转换器</h2>
        <div className="link-grid" style={{ marginTop: 24 }}>
          {converterPages.map((converter) => (
            <Link key={converter.slug} href={`/zh/${converter.slug}`}>
              {converter.title}
            </Link>
          ))}
        </div>
      </section>

      <FaqSection />
    </main>
  );
}
