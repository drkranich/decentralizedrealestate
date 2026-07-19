import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SmartSearch } from "@/components/landing/SmartSearch";
import { FeaturedProperties } from "@/components/landing/FeaturedProperties";
import { Investments } from "@/components/landing/Investments";
import { Manage } from "@/components/landing/Manage";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Marketplace } from "@/components/landing/Marketplace";
import { AI } from "@/components/landing/AI";
import { International } from "@/components/landing/International";
import { Footer } from "@/components/landing/Footer";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <div className="flex justify-center">
        <Link
          to="/app/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-105"
        >
          Open the live app demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <SmartSearch />
      <FeaturedProperties />
      <Investments />
      <Manage />
      <DashboardPreview />
      <Marketplace />
      <AI />
      <International />
      <Footer />
    </div>
  );
}
