import { redirect } from "next/navigation";

export default async function BusinessRootPage({
  params,
}: {
  params: Promise<{ businessHandle: string }>;
}) {
  const { businessHandle } = await params;
  redirect(`/${businessHandle}/book/vehicle`);
}
