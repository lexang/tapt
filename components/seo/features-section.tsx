export function FeaturesSection() {
  const features = [
    {
      title: '极速解析与转换',
      description: '支持超大文件秒级解析，采用前沿前端技术，即时渲染并转换表格数据，无需等待服务器响应。',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: '绝对安全隐私',
      description: '所有文件读取、表格解析及数据生成均在您的浏览器本地完成，绝不会上传任何隐私数据到我们的服务器。',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: '多格式无缝互转',
      description: '支持 Excel, CSV, JSON, Markdown, HTML, SQL 等超过数十种常见数据格式的互相转换，一次操作满足全部需求。',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    }
  ];

  return (
    <section className="content-section" aria-labelledby="features-title">
      <h2 id="features-title">核心特性</h2>
      <div className="features-grid">
        {features.map((feature, idx) => (
          <div key={idx} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
