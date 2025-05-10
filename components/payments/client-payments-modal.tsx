"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentList } from "./payment-list";
import { Client, Payment } from "@/lib/utils";

type ClientPaymentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onCreatePayment: (clientId: string, newPayment: Payment) => Promise<void>;
  onUpdatePayment: (clientId: string, updatedPayment: Payment) => Promise<void>;
  onDeletePayment: (clientId: string, paymentId: string) => Promise<void>;
};

export function ClientPaymentsModal({
  isOpen,
  onClose,
  client,
  onCreatePayment,
  onUpdatePayment,
  onDeletePayment,
}: ClientPaymentsModalProps) {
  const [localClient, setLocalClient] = useState(client);
  const [payments, setPayments] = useState(client.payments);
  const [totalPaid, setTotalPaid] = useState(client.totalPaid);

  const handleCreatePayment = async (newPayment: Payment) => {
    await onCreatePayment(client.id, newPayment);
    
    // Add new payment and update total paid
    setPayments((prevPayments) => [...prevPayments, newPayment]);
    setTotalPaid((prevTotal) => prevTotal + newPayment.amount);
  };

  const handleUpdatePayment = async (updatedPayment: Payment) => {
    await onUpdatePayment(client.id, updatedPayment);
    
    // Update payments and total paid
    const updatedPayments = payments.map((p) =>
      p.id === updatedPayment.id ? updatedPayment : p
    );
    const updatedTotal = updatedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    setPayments(updatedPayments);
    setTotalPaid(updatedTotal);
  };

  const handleDeletePayment = async (paymentId: string) => {
    await onDeletePayment(client.id, paymentId);
    
    // Remove payment and update total paid
    const updatedPayments = payments.filter((p) => p.id !== paymentId);
    const updatedTotal = updatedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    setPayments(updatedPayments);
    setTotalPaid(updatedTotal);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Pagos de {client.name}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <PaymentList
            payments={payments}
            totalPaid={totalPaid}
            onCreatePayment={handleCreatePayment}
            onUpdatePayment={handleUpdatePayment}
            onDeletePayment={handleDeletePayment}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}