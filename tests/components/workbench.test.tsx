import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';

describe('ConverterWorkbench', () => {
  it('初始状态不展示示例结果', () => {
    render(<ConverterWorkbench initialConverterId="excel-to-json" />);

    expect(screen.getByRole('heading', { name: '转换结果' })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toBe('');
    expect(screen.getByText('还没有可预览的表格')).toBeTruthy();
  });

  it('粘贴 CSV 后更新 JSON 结果', () => {
    render(<ConverterWorkbench initialConverterId="csv-to-json" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: 'name,age\nLin,30' },
    });

    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toContain('Lin');
  });

  it('按路由格式解析 JSON 输入', () => {
    render(<ConverterWorkbench initialConverterId="json-to-csv" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":"Lin","age":30}]' },
    });

    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toBe('name,age\nLin,30');
  });

  it('非法 JSON 输入显示错误且不会崩溃', () => {
    render(<ConverterWorkbench initialConverterId="json-to-csv" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":]' },
    });

    expect(screen.getByRole('alert').textContent).toContain('请检查 JSON 数据格式');
    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toBe('');
  });

  it('编辑单元格后立即更新输出', () => {
    render(<ConverterWorkbench initialConverterId="csv-to-json" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: 'name,age\nLin,30' },
    });
    fireEvent.change(screen.getByLabelText('name 第 1 行'), {
      target: { value: 'Ada' },
    });

    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toContain('Ada');
  });

  it('JSON 输出选项可以切换为对象结构', () => {
    render(<ConverterWorkbench initialConverterId="csv-to-json" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: 'name,age\nLin,30' },
    });
    fireEvent.change(screen.getByLabelText('JSON 结构'), {
      target: { value: 'object' },
    });

    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toContain('"rows"');
  });

  it('Excel 输出有数据后显示下载操作', () => {
    render(<ConverterWorkbench initialConverterId="json-to-excel" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":"Lin","age":30}]' },
    });

    expect(screen.getByRole('button', { name: '下载' })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toBe(
      'Excel 文件已生成，可以下载使用。',
    );
  });

  it('点击下载会创建文件链接', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:table');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        Object.defineProperty(element, 'click', { value: click });
      }
      return element;
    });

    render(<ConverterWorkbench initialConverterId="json-to-excel" />);
    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":"Lin","age":30}]' },
    });
    fireEvent.click(screen.getByRole('button', { name: '下载' }));

    await waitFor(() => {
      expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
      expect(click).toHaveBeenCalledTimes(1);
      expect(revokeObjectUrl).toHaveBeenCalledWith('blob:table');
    });
  });
});
