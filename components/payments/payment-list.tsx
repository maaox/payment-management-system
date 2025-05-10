"use client";

import { useState, useEffect } from "react";
import { PaymentItem } from "./payment-item";
import { Payment, formatCurrency } from "@/lib/utils";
import { PaymentForm } from "./payment-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type PaymentSection = {
  title: string;
  payments: Payment[];
};

type PaymentListProps = {
  payments: Payment[];
  totalPaid: number;
  onUpdatePayment?: (updatedPayment: Payment) => Promise<void>;
  onCreatePayment?: (newPayment: Payment) => Promise<void>;
  onDeletePayment?: (paymentId: string) => Promise<void>;
};

export function PaymentList({
  payments,
  totalPaid,
  onUpdatePayment,
  onCreatePayment,
  onDeletePayment,
}: PaymentListProps) {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [sections, setSections] = useState<PaymentSection[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Recalcular las secciones cuando cambie el array de pagos
  useEffect(() => {
    // Group payments by category
    const groupedPayments = payments.reduce((acc, payment) => {
      if (!acc[payment.category]) {
        acc[payment.category] = [];
      }
      acc[payment.category].push(payment);
      return acc;
    }, {} as Record<string, Payment[]>);

    // Extract unique categories
    const uniqueCategories = Object.keys(groupedPayments);
    setCategories(uniqueCategories);

    // Create sections from grouped payments
    const newSections = Object.entries(groupedPayments).map(
      ([category, categoryPayments]) => ({
        title: category,
        payments: categoryPayments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      })
    );

    setSections(newSections);
  }, [payments]);

  const handleCreatePayment = async (data: any) => {
    if (onCreatePayment) {
      const newPayment: Payment = {
        id: Date.now().toString(),
        category: data.category || "Otros",
        concept: data.concept,
        amount: parseFloat(data.amount),
        imageSrc: data.imageSrc,
        clientId: payments[0]?.clientId || "",
        createdAt: new Date(),
      };

      await onCreatePayment(newPayment);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-primary/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-semibold">Total pagado:</h3>
        <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
      </div>

        <div className="flex justify-end">
          <Button
            onClick={() => setIsPaymentFormOpen(true)}
            className="rounded-2xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear pago
          </Button>
        </div>

      {sections.map((section) => (
        <div key={section.title} className="space-y-4">
          <h2 className="text-2xl font-bold">{section.title}</h2>
          <div className="space-y-3">
            {section.payments.map((payment) => (
              <PaymentItem
                key={payment.id}
                payment={payment}
                existingCategories={categories}
                onUpdate={onUpdatePayment}
                onDelete={onDeletePayment}
              />
            ))}
          </div>
        </div>
      ))}

      <PaymentForm
        isOpen={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        onSubmit={handleCreatePayment}
        existingCategories={categories}
      />
    </div>
  );
}
