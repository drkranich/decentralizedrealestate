import { createFileRoute } from "@tanstack/react-router";
import { LegalTechModuleDashboard } from "@/components/app/LegalTechModuleDashboard";

export const Route = createFileRoute("/admin/legal-vault")({
  component: () => <LegalTechModuleDashboard moduleKey="legal-vault" />,
});
