"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentList } from "./payment-list";
import { Client, Payment } from "@/lib/utils";
import { toast, Toaster } from "react-hot-toast";
import { createPayment, updatePayment, deletePayment, getPayments } from "@/lib/api-service";

type ClientPaymentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onPaymentUpdate?: (clientId: string, newTotalPaid: number) => void; // Nueva prop para callback
};

export function ClientPaymentsModal({
  isOpen,
  onClose,
  client,
  onPaymentUpdate,
}: ClientPaymentsModalProps) {
  const [payments, setPayments] = useState<Payment[]>(client.payments || []);
  const [totalPaid, setTotalPaid] = useState(client.totalPaid || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cargar los pagos del cliente desde la API cuando se abre el modal
  useEffect(() => {
    async function loadClientPayments() {
      if (!isOpen || !client.id) return;
      
      setIsLoading(true);
      try {
        const response = await getPayments(client.id);
        
        if (response.error) {
          toast.error(`Error al cargar pagos: ${response.error}`);
          return;
        }

        if (response.data) {
          // Transformar pagos de la API al formato esperado
          const clientPayments = response.data.map((p: any) => ({
            id: p.id,
            clientId: p.clientId,
            category: p.category,
            concept: p.concept,
            amount: parseFloat(p.amount),
            image: p.image,
            imageType: p.imageType,
            createdAt: new Date(p.createdAt),
          }));
          
          setPayments(clientPayments);
          
          // Calcular el total pagado
          const total = clientPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
          setTotalPaid(total);
        }
      } catch (error) {
        console.error("Error loading client payments:", error);
        toast.error("Error al cargar los pagos del cliente");
      } finally {
        setIsLoading(false);
      }
    }

    loadClientPayments();
  }, [isOpen, client.id]);

  const handleCreatePayment = async (newPayment: Payment) => {
    setIsProcessing(true);
    try {
      // Preparar datos para la API
      const paymentData = {
        clientId: client.id,
        category: newPayment.category,
        concept: newPayment.concept,
        amount: newPayment.amount,
        image: newPayment.image,
        imageType: newPayment.imageType,
      };

      const response = await createPayment(paymentData);
      
      if (response.error) {
        toast.error(`Error al crear pago: ${response.error}`);
        return;
      }

      if (response.data) {
        // Transformar respuesta al formato del pago
        const createdPayment: Payment = {
          id: response.data.id,
          clientId: response.data.clientId,
          category: response.data.category,
          concept: response.data.concept,
          amount: parseFloat(response.data.amount),
          image: response.data.image,
          imageType: response.data.imageType,
          createdAt: new Date(response.data.createdAt),
        };

        // Add new payment and update total paid
        setPayments((prevPayments) => [...prevPayments, newPayment]);
        const newTotalPaid = totalPaid + createdPayment.amount;
        setTotalPaid(newTotalPaid);
        
        // Notificar al componente padre sobre el cambio en el total pagado
        if (onPaymentUpdate) {
          onPaymentUpdate(client.id, newTotalPaid);
        }
        
        toast.success("Pago creado con éxito");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Error al crear el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePayment = async (updatedPayment: Payment) => {
    setIsProcessing(true);
    try {
      // Preparar datos para la API
      const paymentData = {
        category: updatedPayment.category,
        concept: updatedPayment.concept,
        amount: updatedPayment.amount,
        image: updatedPayment.image,
        imageType: updatedPayment.imageType,
      };

      const response = await updatePayment(updatedPayment.id, paymentData);
      
      if (response.error) {
        toast.error(`Error al actualizar pago: ${response.error}`);
        return;
      }

      if (response.data) {
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
        
        // Notificar al componente padre sobre el cambio en el total pagado
        if (onPaymentUpdate) {
          onPaymentUpdate(client.id, updatedTotal);
        }
        
        toast.success("Pago actualizado con éxito");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Error al actualizar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      const response = await deletePayment(paymentId);
      
      if (response.error) {
        toast.error(`Error al eliminar pago: ${response.error}`);
        return;
      }

      // Remove payment and update total paid
      const updatedPayments = payments.filter((p) => p.id !== paymentId);
      const updatedTotal = updatedPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      setPayments(updatedPayments);
      setTotalPaid(updatedTotal);
      
      // Notificar al componente padre sobre el cambio en el total pagado
      if (onPaymentUpdate) {
        onPaymentUpdate(client.id, updatedTotal);
      }
      
      toast.success("Pago eliminado con éxito");
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Error al eliminar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <Toaster position="top-right" />
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
            isLoading={isLoading}
            isProcessing={isProcessing}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
