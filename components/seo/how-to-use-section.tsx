export function HowToUseSection() {
  const steps = [
    {
      title: '导入或粘贴',
      description: '直接粘贴文本，或拖拽 / 上传 Excel、CSV 等文件。系统会自动识别格式。',
    },
    {
      title: '在线编辑',
      description: '在表格视图中预览解析结果，可以增删行列、转置、去重、统一大小写等。',
    },
    {
      title: '一键导出',
      description: '选择目标格式与导出选项，复制到剪贴板，或下载为本地文件。',
    },
  ];

  return (
    <section className="content-section" aria-labelledby="how-to-use-title">
      <h2 id="how-to-use-title">使用指南</h2>
      <div className="how-timeline">
        {steps.map((step, idx) => (
          <div key={step.title} className="how-step">
            <div className="how-step-number">{idx + 1}</div>
            <div className="how-step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
