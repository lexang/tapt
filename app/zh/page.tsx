import Link from 'next/link';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';
import { converterPages } from '@/content/converters';

export const metadata = {
  title: '表格转换工具',
  description: '在线转换 Excel、CSV、JSON、Markdown、SQL 和 HTML 表格数据。',
};

export default function ZhHomePage() {
  return (
    <main className="page-shell">
      <ConverterWorkbench initialConverterId="excel-to-json" />
      <section className="content-section" aria-labelledby="popular-converters">
        <h2 id="popular-converters">常用转换器</h2>
        <div className="link-grid">
          {converterPages.map((converter) => (
            <Link key={converter.slug} href={`/zh/${converter.slug}`}>
              {converter.title}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
