import { createFileRoute } from "@tanstack/react-router";
import { EditablePublicPage } from "@/components/landing/EditablePublicPage";

export const Route = createFileRoute("/legaltech-infrastructure")({
  component: () => <EditablePublicPage pageKey="legaltech_infrastructure" />,
});
