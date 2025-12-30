import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mouthful of Dust | State Library Victoria",
  description: "A digital exhibition by State Library Victoria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
