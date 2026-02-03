import ProjectPage from "@/src/components/pages/projects/project";
import { Metadata } from "next";

type Props = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  return {
    title: `פרויקט`,
    description: "ניהול פרויקט",
  };
}

const page = async ({ params }: Props) => {
  const { projectId } = await params;
  return <ProjectPage projectId={projectId} />;
};

export default page;
