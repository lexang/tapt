import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';

describe('ConverterWorkbench', () => {
  it('源数据变化时更新结果', () => {
    render(<ConverterWorkbench initialConverterId="excel-to-json" />);

    expect(screen.getByText('结果')).toBeTruthy();
    expect(screen.getByDisplayValue(/Ada/)).toBeTruthy();
  });

  it('粘贴 CSV 后更新 JSON 结果', () => {
    render(<ConverterWorkbench initialConverterId="csv-to-json" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: 'name,age\nLin,30' },
    });

    expect((screen.getByLabelText('转换结果') as HTMLTextAreaElement).value).toContain('Lin');
  });

  it('按路由格式解析 JSON 输入', () => {
    render(<ConverterWorkbench initialConverterId="json-to-csv" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":"Lin","age":30}]' },
    });

    expect((screen.getByLabelText('转换结果') as HTMLTextAreaElement).value).toBe('name,age\nLin,30');
  });

  it('Excel 输出显示下载操作', () => {
    render(<ConverterWorkbench initialConverterId="json-to-excel" />);

    expect(screen.getByRole('button', { name: '下载' })).toBeTruthy();
    expect((screen.getByLabelText('转换结果') as HTMLTextAreaElement).value).toBe('Excel 文件已生成，可以下载使用。');
  });
});
