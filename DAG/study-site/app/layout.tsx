import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "CS2413 · Study Studio", description: "Your algorithms course, connected. Study lecture concepts, work through original homework, and check step-by-step solutions." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
