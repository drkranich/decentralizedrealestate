import { createFileRoute } from "@tanstack/react-router";
import { BlogPublicPage } from "@/components/landing/EditablePublicPage";

export const Route = createFileRoute("/blog")({
  component: BlogPublicPage,
});
