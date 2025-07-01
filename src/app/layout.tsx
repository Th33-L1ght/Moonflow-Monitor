
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Light Flow',
  description: 'An app for a mother to know which of her children is on their period, track symptoms, and view cycle history.',
};

export const viewport: Viewport = {
    themeColor: '#ffeff2'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
