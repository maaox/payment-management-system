"use client";

import { useState, useEffect } from "react";
import { Role } from "@prisma/client";
import { USER_ROLES, Client, Payment, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ClientForm } from "@/components/users/client-form";
import { ConfirmationDialog } from "@/components/modals/confirmation-dialog";
import { ClientPaymentsModal } from "@/components/payments/client-payments-modal";
import { CreditCard, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api-service";
import { toast, Toaster } from "react-hot-toast";
import { LoadingSpinner } from "@/components/loading-spinner";

const ITEMS_PER_PAGE = 10;

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [selectedClientForPayments, setSelectedClientForPayments] =
    useState<Client | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<"name" | "username" | "code">(
    "name"
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar clientes desde la API
  useEffect(() => {
    async function loadClients() {
      setIsLoading(true);
      try {
        const response = await getUsers(Role.CLIENT);
        if (response.error) {
          toast.error(`Error al cargar clientes: ${response.error}`);
        } else if (response.data) {
          // Transformar datos de la API al formato esperado por el componente
          const clientsData = response.data.map((client: any) => ({
            id: client.id,
            code: client.code,
            name: client.name,
            username: client.username,
            role: USER_ROLES.CLIENT,
            totalInvestment: parseFloat(client.totalInvestment),
            totalPaid: parseFloat(client.totalPaid),
          }));
          setClients(clientsData);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
        toast.error("Error al cargar los clientes");
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.COLLABORATOR) {
      loadClients();
    }
  }, [user]);

  // Check if user is admin or collaborator, if not redirect
  if (
    user?.role !== USER_ROLES.ADMIN &&
    user?.role !== USER_ROLES.COLLABORATOR
  ) {
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
    setIsProcessing(true);
    try {
      // Preparar datos para la API
      const userData = {
        code: data.code,
        name: data.name,
        username: data.username,
        passwordHash: data.password,
        role: Role.CLIENT,
        totalInvestment: data.investment || 0,
      };

      const response = await createUser(userData);
      
      if (response.error) {
        toast.error(`Error al crear cliente: ${response.error}`);
        return;
      }

      if (response.data) {
        // Transformar respuesta al formato del cliente
        const newClient: Client = {
          id: response.data.id,
          code: response.data.code,
          name: response.data.name,
          username: response.data.username,
          role: USER_ROLES.CLIENT,
          totalInvestment: parseFloat(response.data.totalInvestment),
          totalPaid: parseFloat(response.data.totalPaid),
          payments: [],
        };

        setClients((prev) => [...prev, newClient]);
        toast.success("Cliente creado con éxito");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Error al crear el cliente");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClient = async (data: any) => {
    if (!selectedClient) return;
    
    setIsProcessing(true);
    try {
      // Preparar datos para la API
      const userData: any = {
        name: data.name,
        username: data.username,
        totalInvestment: data.investment || selectedClient.totalInvestment,
      };

      // Solo incluir contraseña si se proporciona una nueva
      if (data.password) {
        userData.passwordHash = data.password;
      }

      const response = await updateUser(selectedClient.id, userData);
      
      if (response.error) {
        toast.error(`Error al actualizar cliente: ${response.error}`);
        return;
      }

      if (response.data) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? {
                  ...c,
                  name: data.name,
                  username: data.username,
                  totalInvestment: data.investment || c.totalInvestment,
                  totalPaid: data.totalPaid || c.totalPaid,
                }
              : c
          )
        );
        toast.success("Cliente actualizado con éxito");
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Error al actualizar el cliente");
    } finally {
      setIsProcessing(false);
      setSelectedClient(null);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    setIsProcessing(true);
    try {
      const response = await deleteUser(clientToDelete.id);
      
      if (response.error) {
        toast.error(`Error al eliminar cliente: ${response.error}`);
        return;
      }

      setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
      toast.success("Cliente eliminado con éxito");
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Error al eliminar el cliente");
    } finally {
      setIsProcessing(false);
      setClientToDelete(null);
      setIsDeleteDialogOpen(false);
    }
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

  // Nueva función para actualizar el total pagado de un cliente
  const handlePaymentUpdate = (clientId: string, newTotalPaid: number) => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === clientId
          ? { ...client, totalPaid: newTotalPaid }
          : client
      )
    );
  };

  // Filter and paginate clients
  const filteredClients = clients.filter((client) => {
    const searchValue = searchTerm.toLowerCase();
    if (filterField === "name") {
      return client.name.toLowerCase().includes(searchValue);
    } else if (filterField === "username") {
      return client.username.toLowerCase().includes(searchValue);
    } else {
      return client.code.toLowerCase().includes(searchValue);
    }
  });

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen={true} text="Cargando clientes..." />
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button
          onClick={() => {
            setSelectedClient(null);
            setIsFormOpen(true);
          }}
          className="rounded-2xl w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear cliente
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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
          onValueChange={(value: "name" | "username" | "code") => {
            setFilterField(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="username">Teléfono</SelectItem>
            <SelectItem value="code">Código</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="table-header">
              <TableRow>
                <TableHead className="w-[100px] text-primary-foreground">Código</TableHead>
                <TableHead className="text-primary-foreground">Nombre</TableHead>
                <TableHead className="text-primary-foreground">Teléfono</TableHead>
                <TableHead className="text-right text-primary-foreground">Inversión</TableHead>
                <TableHead className="text-right text-primary-foreground">Pagado</TableHead>
                <TableHead className="text-center text-primary-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay clientes registrados
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client, index) => (
                  <TableRow 
                    key={client.id} 
                    className={`table-row ${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
                  >
                    <TableCell className="font-medium">{client.code}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.username}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(client.totalInvestment)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(client.totalPaid)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openPaymentsModal(client)}
                          aria-label="Ver pagos"
                          className="rounded-full h-8 w-8"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditForm(client)}
                          aria-label="Editar cliente"
                          className="rounded-full h-8 w-8 text-green-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(client)}
                          aria-label="Eliminar cliente"
                          className="rounded-full h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación mejorada */}
      {totalPages > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              // Mostrar solo páginas cercanas a la actual
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (
                (pageNumber === currentPage - 2 && currentPage > 3) ||
                (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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
        isProcessing={isProcessing}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Eliminar cliente"
        description={`¿Estás seguro de eliminar a ${clientToDelete?.name}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteClient}
        isLoading={isProcessing}
      />

      {selectedClientForPayments && (
        <ClientPaymentsModal
          isOpen={isPaymentsModalOpen}
          onClose={() => {
            setIsPaymentsModalOpen(false);
            setSelectedClientForPayments(null);
          }}
          client={selectedClientForPayments}
          onPaymentUpdate={handlePaymentUpdate} // Añadir el callback
        />
      )}
    </div>
  );
}
