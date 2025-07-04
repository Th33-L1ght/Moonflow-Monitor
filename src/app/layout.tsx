
import './globals.css';
import { Inter, Courgette } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata, Viewport } from 'next';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const courgette = Courgette({
  subsets: ['latin'],
  variable: '--font-cursive',
  weight: '400',
});


export const metadata: Metadata = {
  title: 'Light Flo',
  description: 'An app for a mother to know which of her children is on their period, track symptoms, and view cycle history.',
};

export const viewport: Viewport = {
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", inter.variable, courgette.variable)}>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
