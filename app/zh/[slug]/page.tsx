import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';
import { converterPages, getConverterBySlug } from '@/content/converters';
import { FeaturesSection } from '@/components/seo/features-section';
import { SocialProofSection } from '@/components/seo/social-proof-section';

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

  return {
    title: page.title,
    description: page.description,
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

  return (
    <main className="page-shell">
      <section className="hero-section text-center" style={{ marginTop: 24 }}>
        <h1 className="hero-title">{page.title}</h1>
        <p className="hero-subtitle">{page.description}</p>
      </section>
      
      <ConverterWorkbench initialConverterId={page.slug} />

      <SocialProofSection />
      
      <FeaturesSection />

      <section className="content-section" aria-labelledby="how-to-use">
        <h2 id="how-to-use">如何使用 {page.title}</h2>
        <div className="steps-list">
          {page.steps.map((step, idx) => (
            <div key={idx} className="step-item">
              <div className="step-number">{idx + 1}</div>
              <div className="step-content">
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
          {page.faqs.map((faq) => (
            <div key={faq.question} className="faq-item">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section" aria-labelledby="related-converters">
        <h2 id="related-converters">相关转换器</h2>
        <div className="link-grid" style={{ marginTop: 24 }}>
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
    </main>
  );
}
