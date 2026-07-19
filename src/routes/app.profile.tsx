import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/ui";
import { ProfileCard } from "@/components/app/ProfileCard";
import { PlanCard } from "@/components/app/PlanCard";

export const Route = createFileRoute("/app/profile")({
  component: UserProfile,
});

function UserProfile() {
  return (
    <>
      <PageHeader title="Perfil" subtitle="Sua foto, informações pessoais e plano" />
      <div className="space-y-6">
        <ProfileCard />
        <PlanCard />
      </div>
    </>
  );
}
