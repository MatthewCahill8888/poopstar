import { ProfileClient } from "@/components/ProfileClient";

type Props = { params: Promise<{ handle: string }> };

export default async function UserProfilePage({
  params,
}: Props) {
  const { handle } = await params;
  return <ProfileClient handle={handle} />;
}
