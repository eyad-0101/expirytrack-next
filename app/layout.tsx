import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ناجح العربي لمتابعة التواريخ",
  description: "تتبع تواريخ صلاحية مخزونك",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="ar" dir="rtl">
          <body className="min-h-screen bg-ink-50 font-sans antialiased">
            {children}
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
