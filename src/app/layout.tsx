import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: 'ShieldCheck AI - Proteção contra Golpes Digitais',
  description: 'Detete fraudes, phishing e burlas em segundos com inteligência artificial.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-gray-50 md:bg-gray-100 flex items-center justify-center min-h-screen">
        <FirebaseClientProvider>
          <div className="mobile-container shadow-2xl overflow-y-auto">
            {children}
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
