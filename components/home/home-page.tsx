import Link from 'next/link';
import { converterPages } from '@/content/converters';

export function HomePage() {
  const featuredConverters = converterPages.slice(0, 10);
  const formatGroups = [
    { label: 'Excel', count: converterPages.filter((converter) => converter.inputFormat === 'excel').length },
    { label: 'CSV', count: converterPages.filter((converter) => converter.inputFormat === 'csv').length },
    { label: 'JSON', count: converterPages.filter((converter) => converter.inputFormat === 'json').length },
    { label: 'Markdown', count: converterPages.filter((converter) => converter.outputFormat === 'markdown').length },
  ];

  return (
    <main className="home-shell">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="eyebrow">Data Convert Studio</p>
          <h1 id="home-title">表格转换工具</h1>
          <p>把 Excel、CSV、JSON、Markdown、SQL 和 HTML 数据整理成你需要的格式，上传、预览、编辑和导出都在同一个工作台完成。</p>
          <div className="hero-actions">
            <Link className="hero-primary" href="/zh/excel-to-json">
              打开工作台
            </Link>
            <Link className="hero-secondary" href="/zh/csv-to-json">
              CSV 转 JSON
            </Link>
          </div>
        </div>
        <div className="hero-console" aria-hidden="true">
          <div className="console-topbar">
            <span />
            <span />
            <span />
            <strong>csv_to_json.pipeline</strong>
          </div>
          <div className="console-grid">
            <span className="grid-head">name</span>
            <span className="grid-head">age</span>
            <span className="grid-head">role</span>
            <span>Ada</span>
            <span>36</span>
            <span>Engineer</span>
            <span>Lin</span>
            <span>30</span>
            <span>Designer</span>
          </div>
          <pre>{`[
  { "name": "Ada", "role": "Engineer" },
  { "name": "Lin", "role": "Designer" }
]`}</pre>
        </div>
      </section>

      <section className="format-ribbon" aria-label="支持的格式">
        {formatGroups.map((format) => (
          <div key={format.label}>
            <strong>{format.label}</strong>
            <span>{format.count} 个入口</span>
          </div>
        ))}
      </section>

      <section className="converter-matrix" aria-labelledby="popular-converters">
        <div className="section-heading">
          <p className="eyebrow">Converter Matrix</p>
          <h2 id="popular-converters">常用转换</h2>
        </div>
        <div className="converter-strip">
          {featuredConverters.map((converter) => (
            <Link href={`/zh/${converter.slug}`} key={converter.slug}>
              <span>{converter.inputFormat.toUpperCase()}</span>
              <strong>{converter.title}</strong>
              <small>{converter.outputFormat.toUpperCase()}</small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
