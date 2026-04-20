import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KNUH Pharmacy Toolkit',
  description: '산제조제 미니앱',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
