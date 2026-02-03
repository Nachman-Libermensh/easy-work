import DonorsPage from "@/src/components/pages/donors";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ניהול תורמים",
};

const page = () => {
  return <DonorsPage />;
};

export default page;
