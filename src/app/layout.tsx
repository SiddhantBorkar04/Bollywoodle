import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "Bollywoodle - Bollywood Music Guessing Game",
  description: "Guess the Bollywood song from a short audio clip! Inspired by Heardle, Bollywoodle tests your knowledge of modern Bollywood hits.",
  openGraph: {
    title: "Bollywoodle - Bollywood Music Guessing Game",
    description: "Guess the Bollywood song from a short audio clip! Inspired by Heardle, Bollywoodle tests your knowledge of modern Bollywood hits.",
    url: "https://bollywoodle.com/",
    type: "website",
    images: [
      {
        url: "https://bollywoodle.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bollywoodle - Bollywood Music Guessing Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bollywoodle - Bollywood Music Guessing Game",
    description: "Guess the Bollywood song from a short audio clip! Inspired by Heardle, Bollywoodle tests your knowledge of modern Bollywood hits.",
    images: ["https://bollywoodle.com/og-image.png"],
    site: "@bollywoodle",
  },
  metadataBase: new URL("https://bollywoodle.com/"),
  alternates: {
    canonical: "https://bollywoodle.com/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://bollywoodle.com/" />
      </head>
      <body className={`${rajdhani.variable} font-rajdhani antialiased`}>
        <main>{children}</main>
        <footer />
      </body>
    </html>
  );
}
