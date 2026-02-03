"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllDonations,
  createDonation,
  deleteDonationById,
  getAllPaymentMethods,
} from "@/src/api-services/donations.service";
import DataTable from "@/src/components/ui/custom/data-table";
import { ColumnConfig } from "@/src/components/ui/custom/data-table/data-table.types";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { PlusIcon, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/src/components/ui/custom/form";
import { z } from "zod";

export function TransactionManager({
  pledgeId,
  donorId,
  refetchDonors,
  trigger,
}: {
  pledgeId: string;
  donorId: string;
  refetchDonors: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  const {
    data: donationsData,
    isLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["pledge-donations", pledgeId],
    queryFn: () => getAllDonations({ pledgeId }),
    //     enabled: open,
  });

  const donations = donationsData || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDonationById(id),
    onSuccess: () => {
      refetchTransactions();
      refetchDonors();
      toast.success("נמחק");
    },
  });

  const FormDialog = () => {
    const form = useAppForm({
      defaultValues: {
        amountILS: 0,
        receivedAt: new Date(),
        paymentMethodId: "",
        reference: "",
      },
      validators: {
        onChange: z.object({
          amountILS: z.number().positive(),
          receivedAt: z.date(),
          paymentMethodId: z.string().min(1),
          reference: z.string(),
        }),
      },
      onSubmit: async ({ value }) => {
        try {
          await createDonation({
            pledgeId,
            donorId,
            amountILS: value.amountILS as any, // Decimal type handling
            amountOriginal: value.amountILS as any,
            receivedAt: value.receivedAt,
            paymentMethodId: Number(value.paymentMethodId),
            reference: value.reference,
          });
          toast.success("נוסף בהצלחה");
          refetchTransactions();
          refetchDonors();
          setIsAddMode(false);
        } catch (e) {
          toast.error("שגיאה");
          console.error(e);
        }
      },
    });

    return (
      <Dialog open={isAddMode} onOpenChange={setIsAddMode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת תרומה</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.AppField
              name="receivedAt"
              children={(f) => <f.DatePickerField label="תאריך קבלה" />}
            />
            <form.AppField
              name="amountILS"
              children={(f) => <f.TextField type="number" label="סכום (₪)" />}
            />
            <form.AppField
              name="paymentMethodId"
              children={(f) => (
                <f.SelectLookupField
                  label="אמצעי תשלום"
                  lookup="paymentsMethods"
                />
              )}
            />
            <form.AppField
              name="reference"
              children={(f) => <f.TextField label="אסמכתא / הערה" />}
            />
            <form.AppForm>
              <form.SubmitButton lable="שמור" />
            </form.AppForm>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const columns: ColumnConfig[] = [
    { accessorKey: "receivedAt", header: "תאריך", type: "heb-date" },
    { accessorKey: "amountILS", header: "סכום", type: "currency" },
    { accessorKey: "paymentMethod.name", header: "אמצעי תשלום", type: "text" },
    { accessorKey: "reference", header: "אסמכתא", type: "text" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Maximize2 size={14} />
            ניהול תרומות בפועל
          </Button>
        )}
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>תרומות בפועל</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto mt-4">
          <DataTable
            data={donations}
            status={isLoading ? "pending" : "success"}
            columns={columns}
            title=""
            showSearchInput={false}
            headerActions={[
              {
                type: "add",
                title: "הוסף תרומה",
                icon: <PlusIcon size={16} />,
                onClick: () => setIsAddMode(true),
              },
            ]}
            rowActions={[
              {
                type: "delete",
                title: "מחק",
                onClick: (row) => {
                  const toastId = toast.info("האם למחוק תרומה זו?", {
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
                  });
                },
              },
            ]}
          />
        </div>
        <FormDialog />
      </DialogContent>
    </Dialog>
  );
}
