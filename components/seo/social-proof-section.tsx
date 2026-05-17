type FormatTile = {
  key: string;
  label: string;
  className: string;
};

const tiles: FormatTile[] = [
  { key: 'xlsx', label: 'XLSX', className: 'format-tile format-tile-xlsx' },
  { key: 'csv', label: 'CSV', className: 'format-tile format-tile-csv' },
  { key: 'json', label: 'JSON', className: 'format-tile format-tile-json' },
  { key: 'sql', label: 'SQL', className: 'format-tile format-tile-sql' },
  { key: 'md', label: 'MD', className: 'format-tile format-tile-md' },
  { key: 'html', label: 'HTML', className: 'format-tile format-tile-html' },
];

export function SocialProofSection() {
  return (
    <section className="format-proof" aria-label="支持的格式">
      <p className="format-proof-caption">6 种主流表格格式，任意互转</p>
      <p className="format-proof-sub">纯浏览器实现，无需注册，永久免费。</p>
      <div className="format-proof-row" aria-hidden="true">
        {tiles.map((tile, idx) => (
          <span key={tile.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className={tile.className} aria-label={tile.label}>{tile.label}</span>
            {idx < tiles.length - 1 ? <span className="format-proof-arrow">⇄</span> : null}
          </span>
        ))}
      </div>
    </section>
  );
}
