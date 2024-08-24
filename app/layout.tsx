import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import ThemeSwitcher from "./components/ThemeSwitcher";
import SignOutButton from "./components/SignOutButton";
import ClientProvider from "./components/ClientProvider"; // Import your ClientProvider

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <ClientProvider>
        <body className={`${inter.className} min-h-screen flex flex-col overflow-x-hidden`}>
          <header
            className="w-full bg-base-300 text-base-content p-4 pt-8 flex justify-between items-center z-20 relative"
            style={{ height: "60px" }}
          >
            <Link href="/" passHref>
              <div className="flex flex-row justify-between items-center">
                <h1 className="text-xl font-bold">melodari</h1>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              <SignOutButton />
            </div>
          </header>
          <main className="bg-base-200 z-10 w-full flex-1">
            {children}
          </main>
        </body>
      </ClientProvider>
    </html>
  );
}
