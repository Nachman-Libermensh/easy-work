import { requireAuth } from "@/src/lib/auth-guards";

const layout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();
  return <main>{children}</main>;
};
export default layout;
