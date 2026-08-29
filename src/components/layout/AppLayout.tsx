import { ReactNode } from "react";
import { Header } from "./Header";
import { SponsorCarousel } from "./SponsorCarousel";
import { BottomNav } from "@/components/lcu";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-[4.5rem] lg:pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-3 sm:px-4">
          {children}
        </div>
      </main>

      <SponsorCarousel />
      <BottomNav />
      <div className="h-16 lg:hidden" aria-hidden />
    </div>
  );
}
