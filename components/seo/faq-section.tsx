export function FaqSection() {
  const faqs = [
    {
      question: '这个转换工具是免费的吗？',
      answer: '完全免费，不会有隐藏付费、不限次数，也不会有水印。',
    },
    {
      question: '我上传的数据安全吗？',
      answer: '所有解析、编辑、生成都在你的浏览器内完成。我们没有上传接口，看不到也不会存储你的内容。',
    },
    {
      question: '能处理多大的表格？',
      answer: '常规几 MB 到十几 MB 的表格都能秒级处理。受浏览器内存限制，上百 MB 的超大文件可能会卡顿。',
    },
    {
      question: '未来还会增加更多格式吗？',
      answer: '会持续迭代。如果你需要的格式还没有支持，欢迎通过页面底部的链接反馈。',
    },
  ];

  return (
    <section className="content-section" aria-labelledby="faq-title">
      <h2 id="faq-title">常见问题</h2>
      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <details key={faq.question} className="faq-item" open={idx === 0}>
            <summary className="faq-summary">
              <span>{faq.question}</span>
              <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="faq-answer">{faq.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
