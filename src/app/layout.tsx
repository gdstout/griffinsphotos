import Header from "./(components)/Header";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Griffin Stout Photography",
  description: "Film photography by Griffin Stout",
  openGraph: {
    title: "Griffin Stout Photography",
    description: "Film photography by Griffin Stout",
    type: "website",
    images: ["/hirshhorn-looms.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex h-screen flex-col bg-taupe-950 font-serif text-taupe-300">
        <Header />
        {children}
      </body>
    </html>
  );
}
