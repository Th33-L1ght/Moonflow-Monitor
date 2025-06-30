
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import { EnvVarCheck } from '@/components/EnvVarCheck';

export const metadata: Metadata = {
  title: 'Light Flow',
  description: "An app for a mother to know which of her children is on their period, track symptoms, and view cycle history.",
  icons: {
    icon: [],
    shortcut: [],
    apple: [],
    other: [],
  },
};

export const viewport: Viewport = {
  themeColor: '#e0d1ff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
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
