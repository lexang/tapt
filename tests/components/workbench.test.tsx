import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';

describe('ConverterWorkbench', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初始状态不展示示例结果', () => {
    render(<ConverterWorkbench initialConverterId="excel-to-json" />);

    expect(screen.getByRole('heading', { name: '转换结果' })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toBe('');
    expect(screen.getByText('还没有可预览的表格')).toBeTruthy();
  });

  it('粘贴 CSV 后更新 JSON 结果', async () => {
    render(<ConverterWorkbench initialConverterId="csv-to-json" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: 'name,age\nLin,30' },
    });

    await waitFor(() => {
      expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toContain('Lin');
    });
  });

  it('按路由格式解析 JSON 输入', async () => {
    render(<ConverterWorkbench initialConverterId="json-to-csv" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":"Lin","age":30}]' },
    });

    await waitFor(() => {
      expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toBe('name,age\nLin,30');
    });
  });

  it('非法 JSON 输入显示错误且不会崩溃', async () => {
    render(<ConverterWorkbench initialConverterId="json-to-csv" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":]' },
    });

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('请检查 JSON 数据格式');
    });
    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toBe('');
  });

  it('编辑单元格时按回车后更新输出', async () => {
    render(<ConverterWorkbench initialConverterId="csv-to-json" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: 'name,age\nLin,30' },
    });
    await waitFor(() => expect(screen.queryByLabelText('name 第 1 行')).not.toBeNull());
    const cellInput = screen.getByLabelText('name 第 1 行');
    fireEvent.change(cellInput, {
      target: { value: 'Ada' },
    });

    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).not.toContain('Ada');

    fireEvent.keyDown(cellInput, {
      key: 'Enter',
      code: 'Enter',
    });

    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toContain('Ada');
  });

  it('编辑单元格后可以用键盘提交并移动焦点', async () => {
    render(<ConverterWorkbench initialConverterId="csv-to-json" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: 'name,age\nAda,36\nLin,30' },
    });
    await waitFor(() => expect(screen.queryByLabelText('name 第 1 行')).not.toBeNull());

    const firstName = screen.getByLabelText('name 第 1 行') as HTMLInputElement;
    const firstAge = screen.getByLabelText('age 第 1 行') as HTMLInputElement;
    const secondAge = screen.getByLabelText('age 第 2 行') as HTMLInputElement;

    firstName.focus();
    fireEvent.change(firstName, {
      target: { value: 'Grace' },
    });
    fireEvent.keyDown(firstName, {
      key: 'Tab',
      code: 'Tab',
    });

    await waitFor(() => expect(document.activeElement).toBe(firstAge));
    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toContain('Grace');

    fireEvent.change(firstAge, {
      target: { value: '37' },
    });
    fireEvent.keyDown(firstAge, {
      key: 'Enter',
      code: 'Enter',
    });

    await waitFor(() => expect(document.activeElement).toBe(secondAge));
    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toContain('"37"');
  });

  it('JSON 输出选项可以切换为对象结构', async () => {
    render(<ConverterWorkbench initialConverterId="csv-to-json" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: 'name,age\nLin,30' },
    });
    await waitFor(() => {
      expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toContain('Lin');
    });
    fireEvent.change(screen.getByLabelText('JSON 结构'), {
      target: { value: 'object' },
    });

    expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toContain('"rows"');
  });

  it('Excel 输出有数据后显示下载操作', async () => {
    render(<ConverterWorkbench initialConverterId="json-to-excel" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":"Lin","age":30}]' },
    });

    await waitFor(() => {
      expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toBe(
        'Excel 文件已生成，可以下载使用。',
      );
    });
    expect(screen.getByRole('button', { name: '下载' })).toBeTruthy();
  });

  it('Excel 输出禁用复制按钮', async () => {
    render(<ConverterWorkbench initialConverterId="json-to-excel" />);

    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":"Lin","age":30}]' },
    });

    await waitFor(() => {
      expect((screen.getByRole('textbox', { name: '转换结果' }) as HTMLTextAreaElement).value).toBe(
        'Excel 文件已生成，可以下载使用。',
      );
    });
    expect((screen.getByRole('button', { name: '复制' }) as HTMLButtonElement).disabled).toBe(true);
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
    let downloadLink: HTMLAnchorElement | undefined;
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        Object.defineProperty(element, 'click', { value: click });
        downloadLink = element;
      }
      return element;
    });

    render(<ConverterWorkbench initialConverterId="json-to-excel" />);
    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: '[{"name":"Lin","age":30}]' },
    });
    await waitFor(() => {
      expect((screen.getByRole('button', { name: '下载' }) as HTMLButtonElement).disabled).toBe(false);
    });
    fireEvent.click(screen.getByRole('button', { name: '下载' }));

    await waitFor(() => {
      expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
      expect(click).toHaveBeenCalledTimes(1);
      expect(downloadLink?.download).toBe('json-to-excel.xlsx');
    });
    await waitFor(
      () => {
        expect(revokeObjectUrl).toHaveBeenCalledWith('blob:table');
      },
      { timeout: 2000 },
    );
  });

  it('非 Excel 结果可以下载为对应文本文件', async () => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:text');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.fn();
    let downloadLink: HTMLAnchorElement | undefined;
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        Object.defineProperty(element, 'click', { value: click });
        downloadLink = element;
      }
      return element;
    });

    render(<ConverterWorkbench initialConverterId="csv-to-json" />);
    fireEvent.change(screen.getByLabelText('源数据'), {
      target: { value: 'name,age\nAda,36' },
    });
    await waitFor(() => {
      expect((screen.getByRole('button', { name: '下载' }) as HTMLButtonElement).disabled).toBe(false);
    });
    fireEvent.click(screen.getByRole('button', { name: '下载' }));

    await waitFor(() => {
      expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
      expect(click).toHaveBeenCalledTimes(1);
      expect(downloadLink?.download).toBe('csv-to-json.json');
    });
    await waitFor(
      () => {
        expect(revokeObjectUrl).toHaveBeenCalledWith('blob:text');
      },
      { timeout: 2000 },
    );
    const downloadedBlob = createObjectUrl.mock.calls[0]?.[0] as Blob;
    expect(downloadedBlob.type).toBe('application/json;charset=utf-8');
  });
});
