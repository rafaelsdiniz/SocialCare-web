import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { Splash } from "@/components/Splash";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SocialCare — Cuidar é transformar.",
    template: "%s · SocialCare",
  },
  description:
    "Plataforma de gestão de assistência social: famílias, benefícios, visitas, atendimentos e programas sociais.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${jetBrainsMono.variable} h-full`}>
      <body className="min-h-full">
        <AuthProvider>
          <ToastProvider>
            <Splash />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
