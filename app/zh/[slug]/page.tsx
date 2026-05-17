import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';
import { converterPages, getConverterBySlug } from '@/content/converters';
import { FeaturesSection } from '@/components/seo/features-section';
import { SocialProofSection } from '@/components/seo/social-proof-section';
import { ShareBanner } from '@/components/seo/share-banner';

type ConverterRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return converterPages.map((converter) => ({ slug: converter.slug }));
}

export async function generateMetadata({ params }: ConverterRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = converterPages.find((converter) => converter.slug === slug);

  if (!page) {
    return {};
  }

  const url = `/zh/${slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: 'website',
    },
    twitter: {
      title: page.title,
      description: page.description,
    },
  };
}

export default async function ConverterPage({ params }: ConverterRouteProps) {
  const { slug } = await params;
  let page;

  try {
    page = getConverterBySlug(slug);
  } catch {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: page.title,
        description: page.description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: '/zh' },
          { '@type': 'ListItem', position: 2, name: page.title, item: `/zh/${slug}` },
        ],
      },
    ],
  };

  return (
    <main className="page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <section className="converter-hero" aria-labelledby="converter-title">
        <span className="hero-eyebrow">在线 · 免费 · 浏览器本地</span>
        <h1 id="converter-title">{page.title}</h1>
        <p>{page.description}</p>
      </section>

      <ConverterWorkbench initialConverterId={page.slug} />

      <SocialProofSection />

      <FeaturesSection />

      <section className="content-section" aria-labelledby="how-to-use">
        <h2 id="how-to-use">如何使用 {page.title}</h2>
        <div className="how-timeline">
          {page.steps.map((step, idx) => (
            <div key={idx} className="how-step">
              <div className="how-step-number">{idx + 1}</div>
              <div className="how-step-content">
                <h3>步骤 {idx + 1}</h3>
                <p>{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section" aria-labelledby="converter-faq">
        <h2 id="converter-faq">常见问题</h2>
        <div className="faq-list">
          {page.faqs.map((faq, idx) => (
            <details key={faq.question} className="faq-item" open={idx === 0}>
              <summary className="faq-summary">
                <span>{faq.question}</span>
                <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              <div className="faq-answer">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="content-section" aria-labelledby="related-converters">
        <h2 id="related-converters">相关转换器</h2>
        <div className="link-grid" style={{ marginTop: 16 }}>
          {page.relatedSlugs.map((relatedSlug) => {
            const related = getConverterBySlug(relatedSlug);
            return (
              <Link key={related.slug} href={`/zh/${related.slug}`}>
                {related.title}
              </Link>
            );
          })}
        </div>
      </section>

      <ShareBanner />
    </main>
  );
}
