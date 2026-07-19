import { createFileRoute } from "@tanstack/react-router";
import { LegalTechModuleDashboard } from "@/components/app/LegalTechModuleDashboard";

export const Route = createFileRoute("/admin/token-classifications")({
  component: () => <LegalTechModuleDashboard moduleKey="token-classifications" />,
});
