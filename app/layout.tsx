import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '表格转换工具',
  description: '粘贴、上传、编辑并转换表格数据',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
