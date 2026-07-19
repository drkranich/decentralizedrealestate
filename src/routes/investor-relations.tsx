import { createFileRoute } from "@tanstack/react-router";
import { EditablePublicPage } from "@/components/landing/EditablePublicPage";

export const Route = createFileRoute("/investor-relations")({
  component: () => <EditablePublicPage pageKey="investor_relations" />,
});
