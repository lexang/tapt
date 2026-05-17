import Link from 'next/link';

export function GlobalHeader() {
  return (
    <header className="global-header">
      <div className="header-container">
        <Link href="/zh" className="header-logo">
          <span className="brand-mark">T</span>
          <strong>TableConvert</strong>
        </Link>
        <nav className="header-nav">
          <Link href="/zh">首页</Link>
          <a href="https://github.com/Tencent/tdesign-react" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
