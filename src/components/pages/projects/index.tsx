"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable from "../../ui/custom/data-table";
import { ColumnConfig } from "../../ui/custom/data-table/data-table.types";
import { CreateProjectDialog } from "./create-project-dialog";
import {
  getAllProjects,
  deleteProjectById,
} from "@/src/api-services/projects.service";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "../../ui/badge";
import { PlusIcon } from "lucide-react";

const columns: ColumnConfig[] = [
  {
    accessorKey: "name",
    header: "שם הפרויקט",
    type: "text",
  },
  {
    accessorKey: "description",
    header: "תיאור",
    type: "text-long",
  },
  {
    accessorKey: "targetAmount",
    header: "יעד גיוס",
    type: "currency",
    enableSummary: true,
  },
  {
    accessorKey: "managerName",
    header: "מנהל הפרויקט",
    type: "text",
  },
  {
    accessorKey: "status",
    header: "סטטוס",
    type: "custom",
    cell: ({ row }: any) => {
      const statusMap: Record<string, { label: string; variant: any }> = {
        PLANNING: { label: "תכנון", variant: "secondary" },
        ACTIVE: { label: "פעיל", variant: "default" },
        COMPLETED: { label: "הושלם", variant: "success" },
        PAUSED: { label: "מושהה", variant: "destructive" },
      };
      const status = statusMap[row.original.status] || statusMap.ACTIVE;
      return <Badge variant={status.variant}>{status.label}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "תאריך יצירה",
    type: "heb-datetime",
    enableFiltering: false,
  },
];

const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const {
    data: projectsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getAllProjects(),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => deleteProjectById(projectId),
    onMutate: () => {
      toast.loading("מוחק פרויקט...", { id: "delete-project" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("פרויקט נמחק בהצלחה", { id: "delete-project" });
    },
    onError: (error: any) => {
      toast.error(error?.message || "שגיאה במחיקת פרויקט", {
        id: "delete-project",
      });
    },
  });

  const handleEdit = (project: any) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedProject(null);
    setDialogOpen(true);
  };

  const handleView = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div dir="rtl" className="p-2">
      <h1 className="text-2xl font-bold mb-4">ניהול פרויקטים</h1>

      <DataTable
        data={projectsData || []}
        status={isLoading ? "pending" : error ? "error" : "success"}
        columns={columns}
        title="רשימת פרויקטים"
        storageKey="projects"
        showSelectColumn={false}
        rowActionVariant="inline"
        headerActions={[
          {
            type: "add",
            icon: <PlusIcon size={16} />,
            title: "פרויקט חדש",
            onClick: handleAdd,
          },
        ]}
        rowActions={[
          {
            type: "view",
            title: "צפייה",
            onClick: (row) => handleView(row.original.id),
          },
          {
            type: "edit",
            title: "עריכה",
            onClick: (row) => handleEdit(row.original),
          },
          {
            type: "delete",
            title: "מחיקה",
            onClick: (row) => {
              const toastId = toast.info(
                `האם אתה בטוח שברצונך למחוק את ${row.original.name}?`,
                {
                  action: {
                    label: "מחק",
                    onClick: () => {
                      toast.dismiss(toastId);
                      deleteProjectMutation.mutate(row.original.id);
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
          },
        ]}
      />

      <CreateProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={selectedProject}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          setDialogOpen(false);
          setSelectedProject(null);
        }}
      />
    </div>
  );
};

export default ProjectsPage;
