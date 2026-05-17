import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './seo.css';
import { GlobalHeader } from '@/components/layout/global-header';
import { GlobalFooter } from '@/components/layout/global-footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: '表格转换工具 - TableConvert',
  description: '专业的在线表格数据转换工具，支持 Excel、JSON、CSV、SQL、Markdown 等数十种格式互转。全本地处理，保证绝对安全。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body>
        <GlobalHeader />
        {children}
        <GlobalFooter />
      </body>
    </html>
  );
}
