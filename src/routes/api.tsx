import { createFileRoute } from "@tanstack/react-router";
import { EditablePublicPage } from "@/components/landing/EditablePublicPage";

export const Route = createFileRoute("/api")({
  component: () => <EditablePublicPage pageKey="api" />,
});
