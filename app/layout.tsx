import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Patrick_Hand_SC, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { requireAdmin } from "@/lib/supabase-server";
import { SignOutButton } from "./components/AuthButtons";

const display = Patrick_Hand_SC({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const hand = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-hand" });

export const metadata: Metadata = { title: "Humor Admin" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const isAdmin = !!(await requireAdmin());
  return (
      <html lang="en" className={`${display.variable} ${hand.variable}`}>
      <body>
      <header className="topbar">
        <Link href="/" className="logo">🔒 Humor Admin</Link>
        {isAdmin && (
            <nav className="topbar-nav">
              <Link href="/" className="btn btn-sm">Dashboard</Link>
              <Link href="/users" className="btn btn-sm">Users</Link>
              <Link href="/memes" className="btn btn-sm">Memes</Link>
              <Link href="/votes" className="btn btn-sm">Votes</Link>
              <SignOutButton />
            </nav>
        )}
      </header>
      <main className="page">{children}</main>
      </body>
      </html>
  );
}
