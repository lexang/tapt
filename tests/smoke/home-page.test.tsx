import { render, screen } from '@testing-library/react';
import { HomePage } from '@/components/home/home-page';

describe('HomePage', () => {
  it('显示主转换入口', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: '表格转换工具' })).toBeTruthy();
    expect(
      screen.getByText('把 Excel、CSV、JSON、Markdown、SQL 和 HTML 数据整理成你需要的格式，上传、预览、编辑和导出都在同一个工作台完成。'),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { name: '常用转换' })).toBeTruthy();
  });
});
