"use client";

import { useState } from "react";
import { USER_ROLES, MOCK_CLIENTS, Client, Payment, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientForm } from "@/components/users/client-form";
import { ConfirmationDialog } from "@/components/modals/confirmation-dialog";
import { ClientPaymentsModal } from "@/components/payments/client-payments-modal";
import { CreditCard, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [selectedClientForPayments, setSelectedClientForPayments] = useState<Client | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<"name" | "username" | "dni">("name");
  const [currentPage, setCurrentPage] = useState(1);

  // Check if user is admin or collaborator, if not redirect
  if (user?.role !== USER_ROLES.ADMIN && user?.role !== USER_ROLES.COLLABORATOR) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Acceso denegado</h2>
        <p className="text-muted-foreground">
          No tienes permisos para acceder a esta página.
        </p>
      </div>
    );
  }

  const handleCreateClient = async (data: any) => {
    const newClient: Client = {
      id: Date.now().toString(),
      dni: data.dni,
      name: data.name,
      username: data.username,
      role: USER_ROLES.CLIENT,
      totalPaid: 0,
      payments: [],
    };

    setClients((prev) => [...prev, newClient]);
  };

  const handleEditClient = async (data: any) => {
    if (!selectedClient) return;

    setClients((prev) =>
      prev.map((c) =>
        c.id === selectedClient.id
          ? {
              ...c,
              name: data.name,
              username: data.username,
            }
          : c
      )
    );

    setSelectedClient(null);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));

    setClientToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleCreatePayment = async (clientId: string, newPayment: Payment) => {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id === clientId) {
          const updatedPayments = [...client.payments, newPayment];
          
          // Calculate total paid
          const totalPaid = updatedPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
          );
          
          return {
            ...client,
            payments: updatedPayments,
            totalPaid,
          };
        }
        return client;
      })
    );
  };

  const handleUpdatePayment = async (clientId: string, updatedPayment: Payment) => {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id === clientId) {
          const existingPaymentIndex = client.payments.findIndex(
            (p) => p.id === updatedPayment.id
          );

          const updatedPayments = existingPaymentIndex >= 0
            ? client.payments.map((p) =>
                p.id === updatedPayment.id ? updatedPayment : p
              )
            : [...client.payments, updatedPayment];
          
          // Calculate total paid
          const totalPaid = updatedPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
          );
          
          return {
            ...client,
            payments: updatedPayments,
            totalPaid,
          };
        }
        return client;
      })
    );
    
    // Update the selected client for payments if it's open
    if (selectedClientForPayments && selectedClientForPayments.id === clientId) {
      const updatedClient = clients.find(c => c.id === clientId);
      if (updatedClient) {
        setSelectedClientForPayments(updatedClient);
      }
    }
  };

  const handleDeletePayment = async (clientId: string, paymentId: string) => {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id === clientId) {
          const updatedPayments = client.payments.filter(
            (p) => p.id !== paymentId
          );
          
          // Calculate total paid
          const totalPaid = updatedPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
          );
          
          return {
            ...client,
            payments: updatedPayments,
            totalPaid,
          };
        }
        return client;
      })
    );
  };

  const openEditForm = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const openPaymentsModal = (client: Client) => {
    setSelectedClientForPayments(client);
    setIsPaymentsModalOpen(true);
  };

  // Filter and paginate clients
  const filteredClients = clients.filter(client => {
    const searchValue = searchTerm.toLowerCase();
    if (filterField === "name") {
      return client.name.toLowerCase().includes(searchValue);
    } else if (filterField === "username") {
      return client.username.toLowerCase().includes(searchValue);
    } else {
      return client.dni.toLowerCase().includes(searchValue);
    }
  });

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button 
          onClick={() => {
            setSelectedClient(null);
            setIsFormOpen(true);
          }}
          className="rounded-2xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear cliente
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={filterField}
          onValueChange={(value: "name" | "username" | "dni") => {
            setFilterField(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="username">Usuario</SelectItem>
            <SelectItem value="dni">DNI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-4 text-left">DNI</th>
              <th className="px-6 py-4 text-left">Nombre</th>
              <th className="px-6 py-4 text-left">Usuario</th>
              <th className="px-6 py-4 text-left">Total Pagado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.map((client, index) => (
              <tr
                key={client.id}
                className={`table-row ${
                  index % 2 === 0 ? "table-row-even" : "table-row-odd"
                }`}
              >
                <td className="px-6 py-4">{client.dni}</td>
                <td className="px-6 py-4">{client.name}</td>
                <td className="px-6 py-4">{client.username}</td>
                <td className="px-6 py-4">
                  {formatCurrency(client.totalPaid)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openPaymentsModal(client)}
                      aria-label="Ver pagos"
                      className="rounded-full"
                    >
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditForm(client)}
                      aria-label="Editar cliente"
                      className="rounded-full"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDeleteDialog(client)}
                      aria-label="Eliminar cliente"
                      className="rounded-full text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedClients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="rounded-2xl"
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="rounded-2xl"
          >
            Siguiente
          </Button>
        </div>
      )}

      <ClientForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedClient(null);
        }}
        onSubmit={selectedClient ? handleEditClient : handleCreateClient}
        initialData={selectedClient || undefined}
        isEditing={!!selectedClient}
        existingClients={clients}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Eliminar cliente"
        description={`¿Estás seguro de eliminar a ${clientToDelete?.name}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteClient}
      />

      {selectedClientForPayments && (
        <ClientPaymentsModal
          isOpen={isPaymentsModalOpen}
          onClose={() => {
            setIsPaymentsModalOpen(false);
            setSelectedClientForPayments(null);
          }}
          client={selectedClientForPayments}
          onCreatePayment={handleCreatePayment}
          onUpdatePayment={handleUpdatePayment}
          onDeletePayment={handleDeletePayment}
        />
      )}
    </div>
  );
}