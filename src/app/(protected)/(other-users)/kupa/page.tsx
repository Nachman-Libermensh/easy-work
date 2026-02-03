import { Metadata } from "next";
import KupaPage from "@/src/components/pages/kupa";

export const metadata: Metadata = {
  title: "קופת בית הכנסת",
  description: "ניהול קופה",
};
const page = () => {
  return <KupaPage />;
};

export default page;
