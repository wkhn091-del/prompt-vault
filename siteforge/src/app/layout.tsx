import type { Metadata, Viewport } from "next";
import { Outfit, Heebo, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070605",
  colorScheme: "dark",
};

const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SiteForge — מחשב אפס → אתרים מטורפים",
  description:
    "ספר לימוד אינטראקטיבי: 100 שלבים, מדליות, פרויקטים ומבחני שער. אותו DNA ויזואלי כמו Prompt Vault.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${display.variable} ${heebo.variable} ${mono.variable} ${syne.variable} h-full antialiased`}
    >
      <head>
        <meta name="robots" content="noindex" />
      </head>
      <body className="min-h-full overflow-x-clip bg-[#070605] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
