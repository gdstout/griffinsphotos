import Header from "./(components)/Header";
import "./globals.css";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body
        className="flex min-h-screen flex-col overflow-hidden bg-taupe-950 font-serif text-taupe-300
        [@media(max-aspect-ratio:3/4)]:overflow-scroll"
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
