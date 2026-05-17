import Link from 'next/link';
import { converterPages, type ConverterPage } from '@/content/converters';
import { FORMAT_LABELS, type ConverterFormat } from '@/lib/converters/catalog';

export function MatrixLinksSection() {
  const groupedConverters = converterPages.reduce((acc, page) => {
    if (!acc[page.inputFormat]) {
      acc[page.inputFormat] = [];
    }
    acc[page.inputFormat].push(page);
    return acc;
  }, {} as Record<ConverterFormat, ConverterPage[]>);

  const formats = Object.keys(groupedConverters) as ConverterFormat[];

  return (
    <section className="content-section" aria-labelledby="matrix-converters">
      <h2 id="matrix-converters">所有支持的格式转换</h2>
      <div className="matrix-grid">
        {formats.map((format) => (
          <div key={format} className="matrix-column">
            <h3>从 {FORMAT_LABELS[format]} 转换</h3>
            <ul className="matrix-list">
              {groupedConverters[format].map((converter) => (
                <li key={converter.slug}>
                  <Link href={`/zh/${converter.slug}`}>
                    {converter.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
