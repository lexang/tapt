import type { ReactNode } from 'react';

type Feature = {
  title: string;
  description: string;
  bullets: string[];
  illustration: ReactNode;
};

const features: Feature[] = [
  {
    title: '极速解析',
    description: '采用现代前端技术，常规表格在毫秒级完成解析和生成，操作完全无感等待。',
    bullets: [
      '本地完成，无需服务器往返',
      '支持百万级字符 CSV / JSON',
      '边输入边输出，无需点击转换',
    ],
    illustration: (
      <div className="illu-speed" aria-hidden="true">
        <div className="illu-speed-bar"><span /></div>
        <div className="illu-speed-label">
          <strong>0.2s</strong>
          <small>典型 1MB 文件首屏渲染</small>
        </div>
      </div>
    ),
  },
  {
    title: '绝对安全',
    description: '解析、编辑、生成全部在你的浏览器内完成。我们没有上传接口，看不到也存不下你的数据。',
    bullets: [
      '0 上传 · 0 存储 · 0 日志',
      '可在离线断网环境下运行',
      '开源实现，行为可审计',
    ],
    illustration: (
      <div className="illu-shield" aria-hidden="true">
        <div className="illu-shield-icon">✓</div>
        <div className="illu-shield-text">数据从未离开浏览器</div>
        <div className="illu-shield-net">network · blocked</div>
      </div>
    ),
  },
  {
    title: '多格式互转',
    description: 'Excel、CSV、JSON、SQL、Markdown、HTML 六大主流格式自由组合，30 条转换路径全部支持。',
    bullets: [
      '常用开发场景全覆盖',
      '保留表头、列顺序与数据类型',
      '一键复制或下载文件',
    ],
    illustration: (
      <div className="illu-formats" aria-hidden="true">
        <span className="chip teal">CSV</span>
        <span className="arrow">⇄</span>
        <span className="chip amber">JSON</span>
        <span className="arrow">⇄</span>
        <span className="chip">SQL</span>
        <span className="arrow">⇄</span>
        <span className="chip">MD</span>
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section className="content-section" aria-labelledby="features-title">
      <h2 id="features-title">为什么选择 TableConvert</h2>
      <div className="features-zigzag">
        {features.map((feature, idx) => {
          const reverse = idx % 2 === 1;
          return (
            <div key={feature.title} className={`features-row${reverse ? ' reverse' : ''}`}>
              <div className="features-text">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <ul>
                  {feature.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
              <div className="features-illustration">{feature.illustration}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
