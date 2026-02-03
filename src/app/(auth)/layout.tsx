import { requireGuest } from "@/src/lib/auth-guards";

const layout = async ({ children }: { children: React.ReactNode }) => {
  await requireGuest();
  return <main>{children}</main>;
};
export default layout;
