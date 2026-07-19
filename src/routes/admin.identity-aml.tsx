import { createFileRoute } from "@tanstack/react-router";
import { LegalTechModuleDashboard } from "@/components/app/LegalTechModuleDashboard";

export const Route = createFileRoute("/admin/identity-aml")({
  component: () => <LegalTechModuleDashboard moduleKey="identity-aml" />,
});
