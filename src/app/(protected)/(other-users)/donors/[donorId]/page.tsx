import DonorPage from "@/src/components/pages/donors/donor";
import { Metadata } from "next";
import { prisma } from "@repo/database";
import { BreadcrumbUpdate } from "@/src/components/layout/breadcrumb-update";

type Props = {
  params: Promise<{ donorId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { donorId } = await params;
  const donor = await prisma.donor.findUnique({ where: { id: donorId } });
  return {
    title: donor ? `${donor.firstName} ${donor.lastName} | תורם` : "כרטיס תורם",
  };
}

export default async function Page({ params }: Props) {
  const { donorId } = await params;
  // Fetch name for breadcrumb (reuse query logic or rely on prisma cache)
  const donor = await prisma.donor.findUnique({
    where: { id: donorId },
    select: { firstName: true, lastName: true }, // Select only needed fields
  });

  return (
    <>
      {donor && (
        <BreadcrumbUpdate title={`${donor.firstName} ${donor.lastName}`} />
      )}
      <DonorPage donorId={donorId} />
    </>
  );
}
