"use client";

import { useState } from "react";
import { USER_ROLES, MOCK_USERS, User } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CollaboratorForm } from "@/components/users/collaborator-form";
import { ConfirmationDialog } from "@/components/modals/confirmation-dialog";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function CollaboratorsPage() {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<User[]>(
    MOCK_USERS.filter((u) => u.role === USER_ROLES.COLLABORATOR)
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<User | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<"name" | "dni">("name");
  const [currentPage, setCurrentPage] = useState(1);

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
    const newCollaborator: User = {
      id: Date.now().toString(),
      dni: data.dni,
      name: data.name,
      username: data.username,
      role: USER_ROLES.COLLABORATOR,
    };

    setCollaborators((prev) => [...prev, newCollaborator]);
  };

  const handleEditCollaborator = async (data: any) => {
    if (!selectedCollaborator) return;

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

    setSelectedCollaborator(null);
  };

  const handleDeleteCollaborator = async () => {
    if (!collaboratorToDelete) return;

    setCollaborators((prev) =>
      prev.filter((c) => c.id !== collaboratorToDelete.id)
    );

    setCollaboratorToDelete(null);
    setIsDeleteDialogOpen(false);
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
  const filteredCollaborators = collaborators.filter(collaborator => {
    const searchValue = searchTerm.toLowerCase();
    if (filterField === "name") {
      return collaborator.name.toLowerCase().includes(searchValue);
    } else {
      return collaborator.dni.toLowerCase().includes(searchValue);
    }
  });

  const totalPages = Math.ceil(filteredCollaborators.length / ITEMS_PER_PAGE);
  const paginatedCollaborators = filteredCollaborators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <Button 
          onClick={() => {
            setSelectedCollaborator(null);
            setIsFormOpen(true);
          }}
          className="rounded-2xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear colaborador
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
          onValueChange={(value: "name" | "dni") => {
            setFilterField(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="dni">DNI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-4 text-left">Código (DNI)</th>
              <th className="px-6 py-4 text-left">Nombre</th>
              <th className="px-6 py-4 text-left">Usuario</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCollaborators.map((collaborator, index) => (
              <tr
                key={collaborator.id}
                className={`table-row ${
                  index % 2 === 0 ? "table-row-even" : "table-row-odd"
                }`}
              >
                <td className="px-6 py-4">{collaborator.dni}</td>
                <td className="px-6 py-4">{collaborator.name}</td>
                <td className="px-6 py-4">{collaborator.username}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditForm(collaborator)}
                      aria-label="Editar colaborador"
                      className="rounded-full"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openDeleteDialog(collaborator)}
                      aria-label="Eliminar colaborador"
                      className="rounded-full text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedCollaborators.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No hay colaboradores registrados
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

      <CollaboratorForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCollaborator(null);
        }}
        onSubmit={selectedCollaborator ? handleEditCollaborator : handleCreateCollaborator}
        initialData={selectedCollaborator || undefined}
        isEditing={!!selectedCollaborator}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Eliminar colaborador"
        description={`¿Estás seguro de eliminar a ${collaboratorToDelete?.name}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteCollaborator}
      />
    </div>
  );
}