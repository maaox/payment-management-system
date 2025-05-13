"use client";

import { useState, useEffect } from "react";
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
import { User, MOCK_USERS } from "@/lib/utils";

// Corregir el mensaje de validación para el código
const formSchema = z.object({
  code: z.string().min(6, "Código debe tener al menos 6 caracteres"),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  username: z.string().min(3, "Teléfono debe tener al menos 3 caracteres"),
  password: z
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

type CollaboratorFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
  initialData?: Partial<User>;
  isEditing?: boolean;
  isProcessing?: boolean; // Nuevo prop
};

export function CollaboratorForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isProcessing = false, // Valor por defecto
}: CollaboratorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Usar useEffect para resetear el formulario cuando cambia initialData
  useEffect(() => {
    if (initialData && isOpen) {
      form.reset({
        code: initialData.code || "",
        name: initialData.name || "",
        username: initialData.username || "",
        password: "", // Siempre vacío en edición
      });
    }
  }, [initialData, isOpen]);

  // Limpiar el formulario al abrir en modo creación
  useEffect(() => {
    if (isOpen && !isEditing) {
      form.reset({
        code: "",
        name: "",
        username: "",
        password: "",
      });
      setCodeError(null);
      setUsernameError(null);
    }
  }, [isOpen, isEditing]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      username: initialData?.username || "",
      password: "",
    },
  });

  const validateCode = (code: string) => {
    if (!code) return "El código es obligatorio";

    const existingUser = MOCK_USERS.find(
      (user) => user.code === code && user.id !== initialData?.id
    );
    if (existingUser) {
      return "Este código ya está registrado";
    }
    return null;
  };

  const validateUsername = (username: string) => {
    if (!username) return "El teléfono es obligatorio";

    const existingUser = MOCK_USERS.find(
      (user) => user.username === username && user.id !== initialData?.id
    );
    if (existingUser) {
      return "Este teléfono ya está registrado";
    }
    return null;
  };

  const handleSubmit = async (data: FormValues) => {
    // Validar código
    const codeValidationError = validateCode(data.code);
    if (codeValidationError) {
      setCodeError(codeValidationError);
      return;
    }

    // Validar username
    const usernameValidationError = validateUsername(data.username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      return;
    }

    // Validar contraseña solo si es creación o si se proporciona una nueva
    if (!isEditing && !data.password) {
      form.setError("password", {
        type: "manual",
        message: "La contraseña es obligatoria para nuevos colaboradores",
      });
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

  // Actualizar el botón para usar isProcessing
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar colaborador" : "Crear colaborador"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los datos del colaborador"
              : "Ingresa los datos del nuevo colaborador"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="12345678"
                      disabled={isLoading || (isEditing && !!initialData?.code)}
                      className="form-input"
                      onChange={(e) => {
                        field.onChange(e);
                        setCodeError(null);
                      }}
                    />
                  </FormControl>
                  {codeError && (
                    <p className="text-sm font-medium text-destructive">
                      {codeError}
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
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Número de teléfono"
                      disabled={isLoading}
                      className="form-input"
                      onChange={(e) => {
                        field.onChange(e);
                        setUsernameError(null);
                      }}
                    />
                  </FormControl>
                  {usernameError && (
                    <p className="text-sm font-medium text-destructive">
                      {usernameError}
                    </p>
                  )}
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
                      placeholder={"••••••••"}
                      disabled={isLoading}
                      className="form-input"
                    />
                  </FormControl>
                  <FormMessage />
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      Dejar en blanco para mantener la contraseña actual
                    </p>
                  )}
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading || isProcessing}
                className="rounded-2xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isProcessing}
                className="rounded-2xl"
              >
                {isProcessing
                  ? "Guardando..."
                  : isEditing
                  ? "Guardar cambios"
                  : "Crear colaborador"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
