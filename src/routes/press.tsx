import { createFileRoute } from "@tanstack/react-router";
import { EditablePublicPage } from "@/components/landing/EditablePublicPage";

export const Route = createFileRoute("/press")({
  component: () => <EditablePublicPage pageKey="press" />,
});
