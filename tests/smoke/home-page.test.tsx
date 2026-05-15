import { render, screen } from '@testing-library/react';
import { HomePage } from '@/components/home/home-page';

describe('HomePage', () => {
  it('显示主转换入口', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: '表格转换工具' })).toBeTruthy();
    expect(screen.getByText('粘贴、上传、编辑并转换表格数据')).toBeTruthy();
  });
});
