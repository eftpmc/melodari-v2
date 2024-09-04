import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import ClientProvider from "./components/ClientProvider";
import HeaderButtons from "./components/HeaderButtons"; // Import HeaderButtons

export const metadata: Metadata = {
  title: "melodari",
  description: "melody by ari",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en font-modelica">
      <ClientProvider>
        <body className={`min-h-screen flex flex-col overflow-x-hidden`}>
          <header
            className="w-full bg-base-300 text-base-content p-4 pt-8 flex justify-between items-center relative"
            style={{ height: "60px" }}
          >
            <Link href="/" passHref>
              <div className="flex flex-row justify-between items-center">
                <h1 className="text-xl font-bold">Melodari</h1>
              </div>
            </Link>
            <HeaderButtons />
          </header>
          <main className="bg-base-300 w-full flex-1">
            {children}
          </main>
        </body>
      </ClientProvider>
    </html>
  );
}