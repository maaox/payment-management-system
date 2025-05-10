"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Payment, formatCurrency } from "@/lib/utils";
import { ImagePreviewModal } from "@/components/modals/image-preview-modal";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { PaymentForm } from "./payment-form";
import { ConfirmationDialog } from "../modals/confirmation-dialog";

type PaymentItemProps = {
  payment: Payment;
  existingCategories?: string[];
  onUpdate?: (updatedPayment: Payment) => Promise<void>;
  onDelete?: (paymentId: string) => Promise<void>;
};

export function PaymentItem({
  payment,
  onUpdate,
  onDelete,
  existingCategories = [],
}: PaymentItemProps & { existingCategories?: string[] }) {
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleUpdate = async (data: any) => {
    if (!onUpdate) return;

    setIsSaving(true);
    try {
      const updatedPayment = {
        ...payment,
        category: data.category,
        concept: data.concept,
        amount: parseFloat(data.amount) || 0,
        imageSrc: data.imageSrc,
      };

      await onUpdate(updatedPayment);
    } catch (error) {
      console.error("Error updating payment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsSaving(true);
    try {
      await onDelete(payment.id);
    } catch (error) {
      console.error("Error deleting payment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-medium">{payment.concept}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(payment.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-medium">{formatCurrency(payment.amount)}</div>

          <div className="flex items-center gap-2">
            {payment.imageSrc && (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                disabled={isSaving}
                onClick={() => setIsImagePreviewOpen(true)}
                aria-label="Ver comprobante"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}

              
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  disabled={isSaving}
                  onClick={() => setIsEditFormOpen(true)}
                  aria-label="Editar pago"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full text-destructive"
                  disabled={isSaving}
                  onClick={openDeleteDialog}
                  aria-label="Eliminar pago"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              
          </div>
        </div>
      </div>

      {payment.imageSrc && (
        <ImagePreviewModal
          isOpen={isImagePreviewOpen}
          onClose={() => setIsImagePreviewOpen(false)}
          imageSrc={payment.imageSrc}
          title={`Comprobante: ${payment.concept}`}
        />
      )}

      <PaymentForm
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        onSubmit={handleUpdate}
        initialData={{
          category: payment.category,
          concept: payment.concept,
          amount: payment.amount,
          imageSrc: payment.imageSrc,
        }}
        isEditing={true}
        existingCategories={existingCategories}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Eliminar pago"
        description={`¿Estás seguro de eliminar el pago "${payment.concept}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        isLoading={isSaving}
      />
    </div>
  );
}
