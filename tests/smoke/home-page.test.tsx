import { render, screen } from '@testing-library/react';
import { HomePage } from '@/components/home/home-page';

describe('HomePage', () => {
  it('显示主转换入口', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: '表格转换工具' })).toBeTruthy();
    expect(screen.getByText('粘贴数据或上传文件，直接转换为 JSON、CSV、Markdown、SQL、HTML 或 Excel。')).toBeTruthy();
    expect(screen.getByRole('heading', { name: '常用转换' })).toBeTruthy();
  });
});
