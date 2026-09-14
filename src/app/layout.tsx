import Header from "./(components)/Header";
import "./globals.css";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-hidden bg-taupe-950 font-serif text-taupe-300">
        <Header />
        {children}
      </body>
    </html>
  );
}
