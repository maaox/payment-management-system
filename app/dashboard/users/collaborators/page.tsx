"use client";

import { useState, useEffect } from "react";
import { Role } from "@prisma/client";
import { USER_ROLES, User } from "@/lib/utils";
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
import { CollaboratorForm } from "@/components/users/collaborator-form";
import { ConfirmationDialog } from "@/components/modals/confirmation-dialog";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api-service";
import { toast, Toaster } from "react-hot-toast";
import { LoadingSpinner } from "@/components/loading-spinner";

const ITEMS_PER_PAGE = 10;

export default function CollaboratorsPage() {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<User | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<User | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<"name" | "username" | "code">(
    "name"
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar colaboradores desde la API
  useEffect(() => {
    async function loadCollaborators() {
      setIsLoading(true);
      try {
        const response = await getUsers(Role.COLLABORATOR);
        if (response.error) {
          toast.error(`Error al cargar colaboradores: ${response.error}`);
        } else if (response.data) {
          // Transformar datos de la API al formato esperado por el componente
          const collaboratorsData = response.data.map((collab: any) => ({
            id: collab.id,
            code: collab.code,
            name: collab.name,
            username: collab.username,
            role: USER_ROLES.COLLABORATOR,
          }));
          setCollaborators(collaboratorsData);
        }
      } catch (error) {
        console.error("Error loading collaborators:", error);
        toast.error("Error al cargar los colaboradores");
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.role === USER_ROLES.ADMIN) {
      loadCollaborators();
    }
  }, [user]);

  // Check if user is admin, if not redirect
  if (user?.role !== USER_ROLES.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Acceso denegado</h2>
        <p className="text-muted-foreground">
          No tienes permisos para acceder a esta página.
        </p>
      </div>
    );
  }

  const handleCreateCollaborator = async (data: any) => {
    setIsProcessing(true);
    try {
      // Preparar datos para la API
      const userData = {
        code: data.code,
        name: data.name,
        username: data.username,
        passwordHash: data.password, // En producción, la contraseña debería hashearse en el backend
        role: Role.COLLABORATOR,
      };

      const response = await createUser(userData);
      
      if (response.error) {
        toast.error(`Error al crear colaborador: ${response.error}`);
        return;
      }

      if (response.data) {
        // Transformar respuesta al formato del colaborador
        const newCollaborator: User = {
          id: response.data.id,
          code: response.data.code,
          name: response.data.name,
          username: response.data.username,
          role: USER_ROLES.COLLABORATOR,
        };

        setCollaborators((prev) => [...prev, newCollaborator]);
        toast.success("Colaborador creado con éxito");
      }
    } catch (error) {
      console.error("Error creating collaborator:", error);
      toast.error("Error al crear el colaborador");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditCollaborator = async (data: any) => {
    if (!selectedCollaborator) return;
    
    setIsProcessing(true);
    try {
      // Preparar datos para la API
      const userData: any = {
        name: data.name,
        username: data.username,
      };

      // Solo incluir contraseña si se proporciona una nueva
      if (data.password) {
        userData.passwordHash = data.password;
      }

      const response = await updateUser(selectedCollaborator.id, userData);
      
      if (response.error) {
        toast.error(`Error al actualizar colaborador: ${response.error}`);
        return;
      }

      if (response.data) {
        setCollaborators((prev) =>
          prev.map((c) =>
            c.id === selectedCollaborator.id
              ? {
                  ...c,
                  name: data.name,
                  username: data.username,
                }
              : c
          )
        );
        toast.success("Colaborador actualizado con éxito");
      }
    } catch (error) {
      console.error("Error updating collaborator:", error);
      toast.error("Error al actualizar el colaborador");
    } finally {
      setIsProcessing(false);
      setSelectedCollaborator(null);
    }
  };

  const handleDeleteCollaborator = async () => {
    if (!collaboratorToDelete) return;
    
    setIsProcessing(true);
    try {
      const response = await deleteUser(collaboratorToDelete.id);
      
      if (response.error) {
        toast.error(`Error al eliminar colaborador: ${response.error}`);
        return;
      }

      setCollaborators((prev) =>
        prev.filter((c) => c.id !== collaboratorToDelete.id)
      );
      toast.success("Colaborador eliminado con éxito");
    } catch (error) {
      console.error("Error deleting collaborator:", error);
      toast.error("Error al eliminar el colaborador");
    } finally {
      setIsProcessing(false);
      setCollaboratorToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditForm = (collaborator: User) => {
    setSelectedCollaborator(collaborator);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (collaborator: User) => {
    setCollaboratorToDelete(collaborator);
    setIsDeleteDialogOpen(true);
  };

  // Filter and paginate collaborators
  const filteredCollaborators = collaborators.filter((collaborator) => {
    const searchValue = searchTerm.toLowerCase();
    if (filterField === "name") {
      return collaborator.name.toLowerCase().includes(searchValue);
    } else if (filterField === "username") {
      return collaborator.username.toLowerCase().includes(searchValue);
    } else {
      return collaborator.code.toLowerCase().includes(searchValue);
    }
  });

  const totalPages = Math.ceil(filteredCollaborators.length / ITEMS_PER_PAGE);
  const paginatedCollaborators = filteredCollaborators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen={true} text="Cargando colaboradores..." />
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <Button
          onClick={() => {
            setSelectedCollaborator(null);
            setIsFormOpen(true);
          }}
          className="rounded-2xl w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear colaborador
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar colaboradores..."
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
                <TableHead className="text-center text-primary-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCollaborators.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No hay colaboradores registrados
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCollaborators.map((collaborator, index) => (
                  <TableRow 
                    key={collaborator.id} 
                    className={`table-row ${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}`}
                  >
                    <TableCell className="font-medium">
                      {collaborator.code}
                    </TableCell>
                    <TableCell>{collaborator.name}</TableCell>
                    <TableCell>{collaborator.username}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditForm(collaborator)}
                          aria-label="Editar colaborador"
                          className="rounded-full h-8 w-8 text-green-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(collaborator)}
                          aria-label="Eliminar colaborador"
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

      <CollaboratorForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCollaborator(null);
        }}
        onSubmit={
          selectedCollaborator
            ? handleEditCollaborator
            : handleCreateCollaborator
        }
        initialData={selectedCollaborator || undefined}
        isEditing={!!selectedCollaborator}
        isProcessing={isProcessing}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Eliminar colaborador"
        description={`¿Estás seguro de eliminar a ${collaboratorToDelete?.name}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteCollaborator}
        isLoading={isProcessing}
      />
    </div>
  );
}
