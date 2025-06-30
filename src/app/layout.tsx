
import type {Metadata, Viewport} from 'next';
import { Inter, Caveat } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import { EnvVarCheck } from '@/components/EnvVarCheck';
import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontBody = Caveat({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Light Flow',
  description: "An app for a mother to know which of her children is on their period, track symptoms, and view cycle history.",
};

export const viewport: Viewport = {
  themeColor: '#ffeff2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("font-sans antialiased", fontSans.variable, fontBody.variable)}>
          <EnvVarCheck>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </EnvVarCheck>
      </body>
    </html>
  );
}
