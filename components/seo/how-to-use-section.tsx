export function HowToUseSection() {
  const steps = [
    {
      title: '导入或粘贴数据',
      description: '点击上传按钮选择您的 Excel、CSV 文件，或者直接将表格内容复制并粘贴到上方的工作台中。系统会自动识别数据格式。'
    },
    {
      title: '在线检查与编辑',
      description: '您可以在高亮的交互式表格中直观地预览解析后的数据，支持直接修改单元格内容，增删行列等操作，保证数据准确无误。'
    },
    {
      title: '配置并一键导出',
      description: '在选项面板中调整输出格式（如 JSON 的结构、CSV 的分隔符等），然后一键复制转换结果，或直接下载保存为文件。'
    }
  ];

  return (
    <section className="content-section" aria-labelledby="how-to-use-title">
      <h2 id="how-to-use-title">使用指南</h2>
      <div className="steps-list">
        {steps.map((step, idx) => (
          <div key={idx} className="step-item">
            <div className="step-number">{idx + 1}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
