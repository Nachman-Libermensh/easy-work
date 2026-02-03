// export const metadata: Metadata = ()=> ({
//TODO: add metadata here WITH PROJECTNAME

import ProjectPage from "@/src/components/pages/projects/project";
import { Metadata } from "next";
import { prisma } from "@repo/database";

type Props = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });

  return {
    title: project ? `${project.name}` : "פרויקט",
    description: "ניהול פרויקט",
  };
}

const page = async ({ params }: Props) => {
  const { projectId } = await params;
  return <ProjectPage projectId={projectId} />;
};

export default page;
