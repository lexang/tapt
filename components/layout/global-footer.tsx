import Link from 'next/link';
import { converterCatalog } from '@/lib/converters/catalog';

type FooterGroup = {
  heading: string;
  links: Array<{ href: string; label: string }>;
};

function findTitle(slug: string): string {
  return converterCatalog.find((item) => item.slug === slug)?.title ?? slug;
}

function devLink(slug: string) {
  return { href: `/zh/${slug}`, label: findTitle(slug) };
}

const footerGroups: FooterGroup[] = [
  {
    heading: '开发者常用',
    links: [
      devLink('csv-to-json'),
      devLink('json-to-sql'),
      devLink('json-to-csv'),
      devLink('excel-to-json'),
    ],
  },
  {
    heading: '文档转换',
    links: [
      devLink('excel-to-markdown'),
      devLink('html-to-markdown'),
      devLink('csv-to-markdown'),
    ],
  },
  {
    heading: '数据迁移',
    links: [
      devLink('csv-to-sql'),
      devLink('excel-to-sql'),
      devLink('json-to-sql'),
    ],
  },
  {
    heading: '资源',
    links: [
      { href: '#', label: '使用指南' },
      { href: '#', label: '隐私说明' },
      { href: '#', label: '联系反馈' },
      { href: '#', label: '关于' },
    ],
  },
];

export function GlobalFooter() {
  return (
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="brand-mark">T</span>
            <strong>TableConvert</strong>
          </div>
          <p>
            把表格数据搬到你需要的地方。Excel、CSV、JSON、SQL、Markdown、HTML 任意互转，全程在浏览器本地完成。
          </p>
        </div>
        <div className="footer-links-grid">
          {footerGroups.map((group) => (
            <div key={group.heading} className="footer-column">
              <h4>{group.heading}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={`${group.heading}-${link.href}-${link.label}`}>
                    {link.href.startsWith('#') ? (
                      <a href={link.href}>{link.label}</a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TableConvert. 保留所有权利。</p>
      </div>
    </footer>
  );
}
