export function FaqSection() {
  const faqs = [
    {
      question: '这个转换工具是免费的吗？',
      answer: '是的，完全免费。我们提供没有任何隐形消费或功能限制的基础表格转换服务。'
    },
    {
      question: '我上传的数据安全吗？',
      answer: '绝对安全。所有的文件读取、表格解析和转换操作全部在您的浏览器本地内存中进行，我们不会将任何表格数据上传至任何服务器，也绝不记录您的转换内容。'
    },
    {
      question: '支持处理非常庞大的 Excel 表格吗？',
      answer: '本工具优化了前端解析性能，支持百万级字符的表格解析。但受限于浏览器的内存限制，处理过大（如上百MB）的文件时可能会感到卡顿。对于日常办公和开发数据，可以做到秒级无缝转换。'
    },
    {
      question: '除了现有的格式，未来还会增加更多格式吗？',
      answer: '会的。我们正在持续迭代，如果您有特殊的格式转换需求，欢迎在 GitHub 提出 Issue，我们非常乐意为开发者和数据工作者提供更多好用的功能。'
    }
  ];

  return (
    <section className="content-section" aria-labelledby="faq-title">
      <h2 id="faq-title">常见问题解答</h2>
      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <div key={idx} className="faq-item">
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
