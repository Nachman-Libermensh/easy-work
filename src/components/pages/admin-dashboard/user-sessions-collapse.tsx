"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "../../ui/custom/data-table";
import { ColumnConfig } from "../../ui/custom/data-table/data-table.types";
import { useSession, authClient } from "@/src/lib/auth-client";

// פונקציות עזר מקומיות
async function listUserSessionsHelper(userId: string) {
  const res = await authClient.admin.listUserSessions({ userId });
  return res.data;
}

async function revokeUserSessionHelper(sessionToken: string) {
  return await authClient.admin.revokeUserSession({ sessionToken });
}

type UserSessionsCollapseProps = {
  userId: string;
  userName: string;
  currentUserId?: string;
};

export function UserSessionsCollapse({
  userId,
  userName,
  currentUserId,
}: UserSessionsCollapseProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentSessionToken = session?.session?.token;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-sessions", userId],
    queryFn: () => listUserSessionsHelper(userId),
  });

  const sessions = data?.sessions || [];

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionToken: string) => revokeUserSessionHelper(sessionToken),
    onMutate: () => {
      toast.loading("מנתק סשן...", { id: "revoke-session" });
    },
    onSuccess: () => {
      refetch();
      toast.success("סשן נותק בהצלחה", { id: "revoke-session" });
    },
    onError: (error: any) => {
      toast.error(error?.message || "שגיאה בניתוק סשן", {
        id: "revoke-session",
      });
    },
  });

  const columns: ColumnConfig[] = [
    {
      accessorKey: "ipAddress",
      header: "כתובת IP",
      type: "text",
    },
    {
      accessorKey: "userAgent",
      header: "דפדפן",
      type: "text-long",
    },
    {
      accessorKey: "createdAt",
      header: "נוצר",
      type: "heb-datetime",
    },
    {
      accessorKey: "expiresAt",
      header: "פג תוקף",
      type: "heb-datetime",
    },
  ];

  return (
    <DataTable
      data={sessions}
      status={isLoading ? "pending" : error ? "error" : "success"}
      columns={columns}
      title={`סשנים פעילים - ${userName}`}
      storageKey={`user-sessions-${userId}`}
      variant="minimal"
      showPagination={false}
      showSearchInput={false}
      showHeaderActions={false}
      showSelectColumn={false}
      rowActions={[
        {
          type: "delete",
          title: "נתק סשן",
          onClick: (row) => {
            const toastId = toast.info("האם אתה בטוח שברצונך לנתק את הסשן?", {
              action: {
                label: "נתק",
                onClick: () => {
                  toast.dismiss(toastId);
                  revokeSessionMutation.mutate(row.original.token);
                },
              },
              cancel: {
                label: "ביטול",
                onClick: () => {
                  toast.dismiss(toastId);
                },
              },
              duration: 10000,
            });
          },
          hiddenFn: (row) =>
            userId === currentUserId &&
            row.original.token === currentSessionToken,
        },
      ]}
      rowActionVariant="inline"
    />
  );
}
