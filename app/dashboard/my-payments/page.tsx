"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { USER_ROLES, Client, Payment, formatCurrency } from "@/lib/utils";
import { PaymentList } from "@/components/payments/payment-list";
import { CardContent, Card } from "@/components/ui/card";
import { CreditCard, Loader2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { getUser } from "@/lib/api-service";
import { createPayment, updatePayment, deletePayment } from "@/lib/api-service";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function MyPaymentsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [clientData, setClientData] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    async function loadClientData() {
      if (!user || user.role !== USER_ROLES.CLIENT) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getUser(user.id);

        if (response.error) {
          toast.error(`Error al cargar datos: ${response.error}`);
          setIsLoading(false);
          return;
        }

        if (response.data) {
          // Transformar datos de la API al formato esperado
          const clientData = {
            id: response.data.id,
            code: response.data.code,
            name: response.data.name,
            username: response.data.username,
            role: USER_ROLES.CLIENT,
            totalInvestment: parseFloat(response.data.totalInvestment),
            totalPaid:  parseFloat(response.data.totalPaid),
            payments: response.data.payments.map((p: any) => ({
              id: p.id,
              clientId: p.clientId,
              category: p.category,
              concept: p.concept,
              amount: parseFloat(p.amount),
              image: p.image,
              createdAt: new Date(p.createdAt),
            })) || [],
          };

          setClientData(clientData);
          setPayments(clientData.payments);
          setTotalPaid(clientData.totalPaid);
        }
      } catch (error) {
        console.error("Error loading client data:", error);
        toast.error("Error al cargar tus datos");
      } finally {
        setIsLoading(false);
      }
    }

    loadClientData();
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

    setIsProcessing(true);
    try {
      // Preparar datos para la API
      const paymentData = {
        clientId: clientData.id,
        category: newPayment.category,
        concept: newPayment.concept,
        amount: newPayment.amount,
        image: newPayment.image,
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
        setTotalPaid((prevTotal) => prevTotal + createdPayment.amount);
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
    if (!clientData) return;

    setIsProcessing(true);
    try {
      // Preparar datos para la API
      const paymentData = {
        category: updatedPayment.category,
        concept: updatedPayment.concept,
        amount: updatedPayment.amount,
        image: updatedPayment.image,
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
        const totalPaid = updatedPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );

        setPayments(updatedPayments);
        setTotalPaid(totalPaid);
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
    if (!clientData) return;

    setIsProcessing(true);
    try {
      const response = await deletePayment(paymentId);

      if (response.error) {
        toast.error(`Error al eliminar pago: ${response.error}`);
        return;
      }

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
      toast.success("Pago eliminado con éxito");
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Error al eliminar el pago");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen={true} text="Cargando pagos..." />
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
      <Toaster position="top-right" />
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Mis Pagos</h1>
      </div>

      <Card className="shadow-sm rounded-2xl mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 md:place-items-center md:max-w-6xl gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre:</p>
              <p className="font-medium">{clientData.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuario:</p>
              <p className="font-medium">{clientData.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inversión Total:</p>
              <p className="font-medium">
                {formatCurrency(clientData.totalInvestment)}
              </p>
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
        isLoading={isLoading}
        isProcessing={isProcessing}
      />
    </div>
  );
}
