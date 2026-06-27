import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/Providers";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ناجح العربي | متابعة تواريخ الصلاحية",
  description: "تتبع تواريخ صلاحية مخزونك، ثلاجتك، ومنزلك — حتى لا يضيع شيء",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-full bg-ink-50 font-sans antialiased">
        <ClerkProvider>
          <Providers>
            {children}
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: { fontFamily: "IBM Plex Sans Arabic, sans-serif" },
              }}
            />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
