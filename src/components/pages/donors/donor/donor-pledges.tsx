"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllPledges,
  deletePledgeById,
} from "@/src/api-services/pledges.service";
import DataTable from "../../../ui/custom/data-table";
import { ColumnConfig } from "../../../ui/custom/data-table/data-table.types";
import { Badge } from "../../../ui/badge";
import { useState } from "react";
import { CreatePledgeDialog } from "./create-pledge-dialog";
import {
  PlusIcon,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowUpLeftIcon,
} from "lucide-react";
import { ScheduleManager } from "./components/schedule-manager";
import { TransactionManager } from "./components/transaction-manager";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/alert";
import { Button } from "@/src/components/ui/button";

export function DonorPledges({ donorId }: { donorId: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["donor-pledges", donorId],
    queryFn: () => getAllPledges({ donorId }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePledgeById(id),
    onSuccess: () => {
      refetch();
    },
    onError: () => toast.error("שגיאה במחיקת ההתחייבות"),
  });

  const columns: ColumnConfig[] = [
    { accessorKey: "project.name", header: "פרויקט", type: "text" },
    { accessorKey: "purpose", header: "מטרה", type: "text" },
    { accessorKey: "totalAmount", header: "סכום", type: "currency" },
    { accessorKey: "installments", header: "תשלומים", type: "number" },
    {
      accessorKey: "startDate",
      header: "תאריך התחלה",
      type: "heb-date",
    },
    {
      accessorKey: "status",
      header: "סטטוס",
      type: "custom",
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "createdBy.name",
      header: 'נוצר ע"י',
      type: "text",
    },
    { accessorKey: "createdAt", header: "נוצר ב", type: "heb-datetime" },
  ];

  const PledgeDetails = ({ row }: { row: any }) => {
    const pledge = row.original;
    const schedule = pledge.schedule || [];
    const scheduleTotal = schedule.reduce(
      (sum: number, item: any) => sum + Number(item.amount),
      0,
    );
    const isMismatch =
      Math.abs(scheduleTotal - Number(pledge.totalAmount)) > 1.0;

    const paidItems = pledge.donations || [];
    const totalPaid = paidItems.reduce(
      (sum: number, t: any) => sum + Number(t.amountILS),
      0,
    );

    return (
      <div className="p-4 bg-muted/10 space-y-4">
        {/* Header Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Status Alert (Right Side) */}
          <div className="md:col-span-3">
            {isMismatch ? (
              <Alert variant="destructive" className="h-full flex items-center">
                <AlertTriangle className="size-5" />
                <div className="flex-1">
                  <AlertTitle>אי התאמה בסכומים</AlertTitle>
                  <AlertDescription>
                    סך התשלומים בלוח (₪{scheduleTotal.toLocaleString()}) שונה
                    מההתחייבות המקורית (₪
                    {Number(pledge.totalAmount).toLocaleString()}).
                  </AlertDescription>
                </div>
              </Alert>
            ) : (
              <Alert className="h-full flex items-center bg-green-50  border-green-200 text-green-800 [&>svg]:text-green-600">
                <CheckCircle2 className="size-5" />
                <div className="flex-1">
                  <AlertTitle>תקין</AlertTitle>
                  <AlertDescription className="text-green-700">
                    תוכנית התשלומים תואמת לסכום ההתחייבות המקורי.
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>

          {/* Actual Payments Status Alert (Left Side) - Narrower */}
          <div className="md:col-span-1">
            <Alert className="h-full flex flex-col justify-between gap-2 ">
              <div className="flex items-start gap-3">
                <Wallet className="size-4 text-blue-600 mt-0.5" />
                <div>
                  <AlertTitle className="text-blue-700 mb-1">
                    שולם בפועל
                  </AlertTitle>
                  <AlertDescription className="text-2xl font-bold text-blue-800 tabular-nums">
                    ₪{totalPaid.toLocaleString()}
                  </AlertDescription>
                </div>
              </div>
              <TransactionManager
                pledgeId={pledge.id}
                donorId={donorId}
                refetchDonors={refetch}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                  >
                    צפייה וניהול
                    <ArrowUpLeftIcon className="mr-2 h-3.5 w-3.5" />
                  </Button>
                }
              />
            </Alert>
          </div>
        </div>

        {/* Schedule Table */}
        <ScheduleManager
          pledgeId={pledge.id}
          currencyCode={pledge.currencyCode}
          refetchPledges={refetch}
        />
      </div>
    );
  };

  return (
    <>
      <DataTable
        data={data || []}
        status={isLoading ? "pending" : "success"}
        columns={columns}
        title="התחייבויות"
        headerActions={[
          {
            type: "add",
            title: "התחייבות חדשה",
            icon: <PlusIcon size={16} />,
            onClick: () => {
              setSelectedPledge(null);
              setCreateOpen(true);
            },
          },
        ]}
        rowActions={[
          {
            type: "edit",
            title: "עריכה",
            onClick: (row) => {
              setSelectedPledge(row.original);
              setCreateOpen(true);
            },
          },
          {
            type: "delete",
            title: "מחיקת התחייבות",
            onClick: (row) => {
              const toastId = toast.info(
                "האם אתה בטוח שברצונך למחוק התחייבות זו?",
                {
                  action: {
                    label: "מחק",
                    onClick: () => {
                      toast.dismiss(toastId);
                      deleteMutation.mutate(row.original.id);
                    },
                  },
                  cancel: {
                    label: "ביטול",
                    onClick: () => toast.dismiss(toastId),
                  },
                  duration: 5000,
                },
              );
            },
          },
        ]}
        collapseComponent={(row) => <PledgeDetails row={row} />}
      />
      <CreatePledgeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        donorId={donorId}
        pledgeToEdit={selectedPledge}
        onSuccess={() => {
          setSelectedPledge(null);
          refetch();
        }}
      />
    </>
  );
}
