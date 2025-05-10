"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { USER_ROLES, MOCK_CLIENTS, Client, Payment } from "@/lib/utils";
import { PaymentList } from "@/components/payments/payment-list";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function MyPaymentsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [clientData, setClientData] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    if (user && user.role === USER_ROLES.CLIENT) {
      // Fetch client data
      const client = MOCK_CLIENTS.find((c) => c.id === user.id);
      setClientData(client || null);
      setPayments(client?.payments || []);
      setTotalPaid(client?.totalPaid || 0);
    }
    setIsLoading(false);
  }, [user]);

  // Check if user is client, if not redirect
  if (!isLoading && user?.role !== USER_ROLES.CLIENT) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Acceso denegado</h2>
        <p className="text-muted-foreground">
          No tienes permisos para acceder a esta página.
        </p>
      </div>
    );
  }

  const handleCreatePayment = async (newPayment: Payment) => {
    if (!clientData) return;

    // Add new payment and update total paid
    setPayments((prevPayments) => [...prevPayments, newPayment]);
    setTotalPaid((prevTotal) => prevTotal + newPayment.amount);
  };

  const handleUpdatePayment = async (updatedPayment: Payment) => {
    if (!clientData) return;
    
    // Update payments and total paid
    const updatedPayments = payments.map((p) =>
      p.id === updatedPayment.id ? updatedPayment : p
    );
    const totalPaid = updatedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    setPayments(updatedPayments);
    setTotalPaid(totalPaid);
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!clientData) return;

    // Remove payment and update total paid
    const updatedPayments = payments.filter(
      (payment) => payment.id !== paymentId
    );
    const totalPaid = updatedPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    setPayments(updatedPayments);
    setTotalPaid(totalPaid);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-primary">Cargando...</div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">No se encontraron datos</h2>
        <p className="text-muted-foreground">
          No pudimos encontrar tus datos de pago.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Mis Pagos</h1>
      </div>

      <Card className="shadow-sm rounded-2xl mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre:</p>
              <p className="font-medium">{clientData.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuario:</p>
              <p className="font-medium">{clientData.username}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PaymentList
        payments={payments}
        totalPaid={totalPaid}
        onCreatePayment={handleCreatePayment}
        onUpdatePayment={handleUpdatePayment}
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
}
