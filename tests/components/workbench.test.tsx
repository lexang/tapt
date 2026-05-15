import { render, screen } from '@testing-library/react';
import { ConverterWorkbench } from '@/components/workbench/converter-workbench';

describe('ConverterWorkbench', () => {
  it('源数据变化时更新结果', () => {
    render(<ConverterWorkbench initialConverterId="excel-to-json" />);

    expect(screen.getByText('结果')).toBeTruthy();
    expect(screen.getByDisplayValue(/Ada/)).toBeTruthy();
  });
});
