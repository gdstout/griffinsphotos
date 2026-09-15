import Header from "./(components)/Header";
import "./globals.css";

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
