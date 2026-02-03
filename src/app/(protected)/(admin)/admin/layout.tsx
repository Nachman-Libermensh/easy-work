import { requireAdmin } from "@/src/lib/auth-guards";

const layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAdmin();
  return <main>{children}</main>;
};
export default layout;
