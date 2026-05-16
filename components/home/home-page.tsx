import Link from 'next/link';
import { converterPages } from '@/content/converters';

export function HomePage() {
  return (
    <main className="home-shell">
      <section className="home-hero" aria-labelledby="home-title">
        <p className="eyebrow">本地处理 · 快速转换</p>
        <h1 id="home-title">表格转换工具</h1>
        <p>粘贴数据或上传文件，直接转换为 JSON、CSV、Markdown、SQL、HTML 或 Excel。</p>
      </section>
      <section aria-labelledby="popular-converters">
        <h2 id="popular-converters">常用转换</h2>
        <div className="converter-strip">
          {converterPages.slice(0, 8).map((converter) => (
            <Link href={`/zh/${converter.slug}`} key={converter.slug}>
              {converter.title}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
