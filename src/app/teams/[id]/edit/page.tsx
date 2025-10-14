import TeamForm from "@/components/forms/team-form";

interface EditTeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { id } = await params;
  return <TeamForm teamId={id} isEdit={true} />;
}
