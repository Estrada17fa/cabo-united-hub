import { ReactNode } from "react";
import { Header } from "./Header";
import { SponsorCarousel } from "./SponsorCarousel";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      {/* Main content with padding for header and sponsor footer */}
      <main className="flex-1 pt-20 md:pt-24 pb-20">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      
      <SponsorCarousel />
    </div>
  );
}
