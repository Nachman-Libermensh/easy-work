import ProjectsPage from "@/src/components/pages/projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ניהול פרויקטים",
  description: "ניהול פרויקטים וגיוסים",
};

const page = () => {
  return <ProjectsPage />;
};

export default page;
