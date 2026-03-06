import { ToiletDetailClient } from "@/components/ToiletDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function ToiletPage({ params }: Props) {
  const { id } = await params;
  return <ToiletDetailClient toiletId={id} />;
}
