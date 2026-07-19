import { createFileRoute } from "@tanstack/react-router";
import { EditablePublicPage } from "@/components/landing/EditablePublicPage";

export const Route = createFileRoute("/privacy")({
  component: () => <EditablePublicPage pageKey="privacy" />,
});
