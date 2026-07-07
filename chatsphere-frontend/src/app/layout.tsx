import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChatSphere',
  description: 'Real-time chat application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900">{children}</body>
    </html>
  );
}