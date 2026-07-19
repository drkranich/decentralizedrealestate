import { createFileRoute } from "@tanstack/react-router";
import { EditablePublicPage } from "@/components/landing/EditablePublicPage";

export const Route = createFileRoute("/status")({
  component: () => <EditablePublicPage pageKey="status" />,
});
