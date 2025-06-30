
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import { EnvVarCheck } from '@/components/EnvVarCheck';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
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
