import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';
import { converterPages, getConverterBySlug } from '@/content/converters';

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
      <section className="content-section" aria-labelledby="converter-page-title">
        <h1 id="converter-page-title">{page.title}</h1>
        <p>{page.description}</p>
      </section>
      <ConverterWorkbench initialConverterId={page.slug} />
      <section className="content-section" aria-labelledby="how-to-use">
        <h2 id="how-to-use">如何使用 {page.title}</h2>
        <ol>
          {page.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <section className="content-section" aria-labelledby="converter-faq">
        <h2 id="converter-faq">常见问题</h2>
        <div className="faq-list">
          {page.faqs.map((faq) => (
            <article key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="content-section" aria-labelledby="related-converters">
        <h2 id="related-converters">相关转换器</h2>
        <div className="link-grid">
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
