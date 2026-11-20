import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

import { APP_NAME, COLLEGE_NAME_WITH_SHORT } from "@/config/college";

export const metadata: Metadata = {
  title: `${APP_NAME} | ${COLLEGE_NAME_WITH_SHORT}`,
  description:
    `Next-generation pedagogical AI case generation, classroom simulations, and curricular intelligence for ${COLLEGE_NAME_WITH_SHORT}.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const urlParams = new URLSearchParams(window.location.search);
                const paramTheme = urlParams.get('theme');
                const theme = paramTheme || localStorage.getItem('sbs-caselab-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-accent/20 selection:text-accent">
        {children}
      </body>
    </html>
  );
}
