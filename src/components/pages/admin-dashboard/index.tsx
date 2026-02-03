"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "../../ui/custom/data-table";
import { ColumnConfig } from "../../ui/custom/data-table/data-table.types";
import { CreateUserDialog } from "./create-user-dialog";
import { UserSessionsCollapse } from "./user-sessions-collapse";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { authClient, useSession } from "@/src/lib/auth-client";
import {
  PlusIcon,
  UserLockIcon,
  UserRoundX,
  UserRoundXIcon,
} from "lucide-react";

// פונקציות עזר מקומיות לקריאות admin
async function listUsersHelper() {
  const res = await authClient.admin.listUsers({
    query: {},
    fetchOptions: {},
  });
  return res.data?.users;
}

async function removeUserHelper(userId: string) {
  return await authClient.admin.removeUser({ userId });
}

async function banUserHelper(userId: string, reason: string) {
  return await authClient.admin.banUser({ userId, banReason: reason });
}

async function unbanUserHelper(userId: string) {
  return await authClient.admin.unbanUser({ userId });
}

async function setUserPasswordHelper(userId: string, password: string) {
  return await authClient.admin.setUserPassword({
    userId,
    newPassword: password,
  });
}

const columns: ColumnConfig[] = [
  {
    accessorKey: "name",
    header: "שם",
    type: "text",
  },
  {
    accessorKey: "email",
    header: "אימייל",
    type: "text",
  },
  {
    accessorKey: "role",
    header: "תפקיד",
    type: "text",
  },
  {
    accessorKey: "createdAt",
    header: "תאריך הצטרפות",
    type: "heb-datetime",
  },
  {
    accessorKey: "banned",
    header: "חסום",
    type: "boolean-badge",
  },
  {
    accessorKey: "emailVerified",
    header: "אימייל מאומת",
    type: "boolean-icon",
  },
];

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);

  const {
    data: usersData,
    isLoading,
    error,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: listUsersHelper,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => removeUserHelper(userId),
    onMutate: () => {
      toast.loading("מוחק משתמש...", { id: "delete-user" });
    },
    onSuccess: () => {
      refetchUsers();
      toast.success("משתמש נמחק בהצלחה", { id: "delete-user" });
    },
    onError: (error: any) => {
      toast.error(error?.message || "שגיאה במחיקת משתמש", {
        id: "delete-user",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: (userId: string) => banUserHelper(userId, "חסום על ידי מנהל"),
    onMutate: () => {
      toast.loading("חוסם משתמש...", { id: "ban-user" });
    },
    onSuccess: () => {
      refetchUsers();
      toast.success("משתמש נחסם בהצלחה", { id: "ban-user" });
    },
    onError: (error: any) => {
      toast.error(error?.message || "שגיאה בחסימת משתמש", { id: "ban-user" });
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: (userId: string) => unbanUserHelper(userId),
    onMutate: () => {
      toast.loading("מסיר חסימה...", { id: "unban-user" });
    },
    onSuccess: () => {
      refetchUsers();
      toast.success("חסימת משתמש הוסרה בהצלחה", { id: "unban-user" });
    },
    onError: (error: any) => {
      toast.error(error?.message || "שגיאה בהסרת חסימה", { id: "unban-user" });
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      setUserPasswordHelper(userId, password),
    onMutate: () => {
      toast.loading("משנה סיסמה...", { id: "change-password" });
    },
    onSuccess: (result: any) => {
      if (result?.code === "PASSWORD_TOO_SHORT") {
        toast.error("הסיסמא שבחרת קצרה מידי", { id: "change-password" });
        return;
      }
      if (result?.code || result?.error) {
        toast.error(result?.message || "שגיאה בשינוי סיסמה", {
          id: "change-password",
        });
        return;
      }
      toast.success("סיסמה שונתה בהצלחה", { id: "change-password" });
      setPasswordDialogOpen(false);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "שגיאה בשינוי סיסמה", {
        id: "change-password",
      });
    },
  });

  const handlePasswordChange = () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("סיסמה חייבת להכיל לפחות 8 תווים");
      return;
    }
    if (selectedUser && newPassword) {
      setPasswordMutation.mutate({
        userId: selectedUser.id,
        password: newPassword,
      });
    }
  };

  return (
    <div dir="rtl" className="p-2">
      <h1 className="text-2xl font-bold mb-4">ניהול משתמשים</h1>

      <DataTable
        data={usersData || []}
        status={isLoading ? "pending" : error ? "error" : "success"}
        columns={columns}
        title="רשימת משתמשים"
        storageKey="admin-users"
        showSelectColumn={true}
        selectColumnPosition="right"
        rowActionVariant="popover"
        rowClassNameFn={(row) => {
          // אינדיקציה למשתמש המחובר
          if (row.original.id === currentUserId)
            return "bg-green-50 dark:bg-green-950/30 border-r-4 border-r-green-500 font-semibold";
          if (row.original.banned)
            return "bg-red-50 dark:bg-red-950/30 opacity-70";
          if (row.original.role === "admin")
            return "bg-indigo-50 dark:bg-indigo-950/30 font-medium";
          return "";
        }}
        headerActions={[
          {
            type: "add",
            title: "הוסף משתמש",
            onClick: () => setCreateUserDialogOpen(true),
            icon: <PlusIcon size={16} />,
          },
        ]}
        collapseComponent={(row) => (
          <UserSessionsCollapse
            userId={row.original.id}
            userName={row.original.name}
            currentUserId={currentUserId}
          />
        )}
        rowActions={[
          {
            type: "custom",
            icon: <UserLockIcon size={16} />,
            title: "שנה סיסמה",
            onClick: (row) => {
              setSelectedUser(row.original);
              setPasswordDialogOpen(true);
            },
          },
          {
            type: "custom",
            icon: <UserRoundXIcon size={16} />,
            title: (row) => (row.original.banned ? "בטל חסימה" : "חסום משתמש"),
            onClick: (row) => {
              const isBanned = row.original.banned;
              const action = isBanned ? "בטל חסימה" : "חסום משתמש";

              const toastId = toast.info(
                `האם אתה בטוח שברצונך ל${action} של ${row.original.name}?`,
                {
                  action: {
                    label: "אישור",
                    onClick: () => {
                      toast.dismiss(toastId);
                      if (isBanned) {
                        unbanUserMutation.mutate(row.original.id);
                      } else {
                        banUserMutation.mutate(row.original.id);
                      }
                    },
                  },
                  cancel: {
                    label: "ביטול",
                    onClick: () => {
                      toast.dismiss(toastId);
                    },
                  },
                  duration: 10000,
                }
              );
            },
            hiddenFn: (row) => row.original.id === currentUserId,
          },
          {
            type: "delete",
            onClick: (row) => {
              const toastId = toast.info(
                `האם אתה בטוח שברצונך למחוק את ${row.original.name}?`,
                {
                  action: {
                    label: "מחק",
                    onClick: () => {
                      toast.dismiss(toastId);
                      deleteUserMutation.mutate(row.original.id);
                    },
                  },
                  cancel: {
                    label: "ביטול",
                    onClick: () => {
                      toast.dismiss(toastId);
                    },
                  },
                  duration: 10000,
                }
              );
            },
            hiddenFn: (row) => row.original.id === currentUserId,
          },
        ]}
      />

      <CreateUserDialog
        open={createUserDialogOpen}
        onOpenChange={setCreateUserDialogOpen}
        onSuccess={() => {
          refetchUsers();
          setCreateUserDialogOpen(false);
        }}
      />

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שינוי סיסמה עבור {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">סיסמה חדשה</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="הכנס סיסמה חדשה (לפחות 6 תווים)"
              />
            </div>
            <div className="flex justify-end gap-2 w-full">
              <Button
                className="w-1/2"
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
              >
                ביטול
              </Button>
              <Button
                className="w-1/2"
                onClick={handlePasswordChange}
                disabled={setPasswordMutation.isPending}
              >
                שמור
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
