import { createFileRoute } from "@tanstack/react-router";
import { LegalTechModuleDashboard } from "@/components/app/LegalTechModuleDashboard";

export const Route = createFileRoute("/admin/compliance-engine")({
  component: () => <LegalTechModuleDashboard moduleKey="compliance-engine" />,
});
