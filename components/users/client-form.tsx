"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Client, MOCK_CLIENTS, MOCK_USERS } from "@/lib/utils";

const formSchema = z.object({
  dni: z.string().min(8, "DNI debe tener al menos 8 caracteres"),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  username: z.string().min(3, "Usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

type ClientFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
  initialData?: Partial<Client>;
  isEditing?: boolean;
  existingClients: Client[];
};

export function ClientForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  existingClients,
}: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dniError, setDniError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni: initialData?.dni || "",
      name: initialData?.name || "",
      username: initialData?.username || "",
      password: "",
    },
  });

  const validateDni = (dni: string) => {
    const allUsers = [...MOCK_USERS, ...existingClients];
    const existingUser = allUsers.find(
      (user) => user.dni === dni && user.id !== initialData?.id
    );
    if (existingUser) {
      return "Este DNI ya está registrado";
    }
    return null;
  };

  const handleSubmit = async (data: FormValues) => {
    const dniValidationError = validateDni(data.dni);
    if (dniValidationError) {
      setDniError(dniValidationError);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar cliente" : "Crear cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los datos del cliente"
              : "Ingresa los datos del nuevo cliente"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="12345678"
                      disabled={isLoading || (isEditing && !!initialData?.dni)}
                      className="form-input"
                      onChange={(e) => {
                        field.onChange(e);
                        setDniError(null);
                      }}
                    />
                  </FormControl>
                  {dniError && (
                    <p className="text-sm font-medium text-destructive">
                      {dniError}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nombre completo"
                      disabled={isLoading}
                      className="form-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="username"
                      disabled={isLoading}
                      className="form-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? "Nueva contraseña" : "Contraseña"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="form-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-2xl"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="rounded-2xl">
                {isLoading
                  ? "Guardando..."
                  : isEditing
                  ? "Guardar cambios"
                  : "Crear cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}