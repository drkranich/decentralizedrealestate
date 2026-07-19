import { createFileRoute } from "@tanstack/react-router";
import { LegalTechModuleDashboard } from "@/components/app/LegalTechModuleDashboard";

export const Route = createFileRoute("/admin/escrow-reconciliation")({
  component: () => <LegalTechModuleDashboard moduleKey="escrow-reconciliation" />,
});
