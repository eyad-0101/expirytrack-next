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
    <html lang="ar" dir="rtl" className="h-full" suppressHydrationWarning>
      <head>
        {/*
         * Blocking script to prevent flash of wrong theme.
         * Reads localStorage or prefers-color-scheme and sets the 'dark' class
         * on <html> BEFORE React hydrates.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-ink-50 font-sans antialiased dark:bg-ink-900 dark:text-ink-100">
        <ClerkProvider>
          <Providers>
            {children}
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: { fontFamily: "IBM Plex Sans Arabic, sans-serif" },
                className: "dark:!bg-ink-800 dark:!text-ink-100 dark:!border-ink-700",
              }}
            />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
