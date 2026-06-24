import type { Metadata } from "next";
import { Inter, Montserrat, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { SiteLayout } from "@/components/layout/site-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/hooks/use-auth";

// Inter carries all body + UI text (nav, paragraphs, buttons, labels, tables).
// Its tall x-height and open apertures stay legible at 14–16px across the
// data-dense listing/dashboard/form surfaces a job portal is made of.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Montserrat is reserved for headings/display only — geometric impact at large
// sizes, where its even strokes read as confident rather than monotonous.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
});

// Source Serif is reserved for rare editorial pull-quote moments only.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "NayaJagir - Find Your Dream Job",
  description: "Connecting talented professionals with amazing opportunities. Find your dream job or discover your next great hire.",
  keywords: ["jobs", "careers", "employment", "hiring", "recruitment"],
  authors: [{ name: "NayaJagir Team" }],
  openGraph: {
    title: "NayaJagir - Find Your Dream Job",
    description: "Connecting talented professionals with amazing opportunities.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NayaJagir - Find Your Dream Job",
    description: "Connecting talented professionals with amazing opportunities.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${montserrat.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <ErrorBoundary>
                <SiteLayout>
                  {children}
                </SiteLayout>
              </ErrorBoundary>
            </AuthProvider>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
