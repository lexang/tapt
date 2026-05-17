import Link from 'next/link';
import { converterPages } from '@/content/converters';

export function GlobalFooter() {
  return (
    <footer className="global-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="brand-mark">T</span>
            <strong>TableConvert</strong>
          </div>
          <p>专业的在线表格数据转换工具，支持 Excel、JSON、CSV、SQL、Markdown 等数十种格式互转。所有数据均在您的浏览器本地处理，绝对安全。</p>
        </div>
        <div className="footer-links-grid">
          <div className="footer-column">
            <h4>热门转换</h4>
            <ul>
              {converterPages.slice(0, 5).map(page => (
                <li key={page.slug}>
                  <Link href={`/zh/${page.slug}`}>{page.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-column">
            <h4>更多工具</h4>
            <ul>
              {converterPages.slice(5, 10).map(page => (
                <li key={page.slug}>
                  <Link href={`/zh/${page.slug}`}>{page.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TableConvert. 保留所有权利。</p>
      </div>
    </footer>
  );
}
