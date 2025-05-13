"use client";

import { useState, useEffect, useRef } from "react";
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
import Image from "next/image";
import { Upload, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression"; // Necesitarás instalar esta dependencia

const formSchema = z.object({
  category: z.string().min(1, "La categoría es requerida"),
  concept: z.string().min(1, "El concepto es requerido"),
  amount: z.string().min(1, "El monto es requerido"),
});

type FormValues = z.infer<typeof formSchema>;

type PaymentFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: FormValues & { image: string | null; imageType: string | null }
  ) => Promise<void>;
  initialData?: {
    category?: string;
    concept?: string;
    amount?: number;
    image?: string | null;
    imageType?: string | null;
  };
  isEditing?: boolean;
  existingCategories?: string[];
  isProcessing?: boolean;
};

export function PaymentForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  existingCategories = [],
  isProcessing = false,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Actualizar tempImageUrl cuando cambia initialData.image o initialData.imageType
  useEffect(() => {
    if (initialData && initialData.image) {
      const mimeType = initialData.imageType || "image/jpeg";
      const imageUrl = `data:${mimeType};base64,${initialData.image}`;
      setTempImageUrl(imageUrl);
      setImageType(mimeType);
    }
  }, [initialData?.image, initialData?.imageType]);

  // Obtener categorías únicas de los pagos existentes
  useEffect(() => {
    // Asegurarse de que la categoría actual esté incluida si existe
    const uniqueCategories = Array.from(new Set(existingCategories));
    if (
      initialData?.category &&
      !uniqueCategories.includes(initialData.category)
    ) {
      uniqueCategories.push(initialData.category);
    }
    setCategories(uniqueCategories);
  }, [existingCategories, initialData?.category]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: initialData?.category || "",
      concept: initialData?.concept || "",
      amount: initialData?.amount ? initialData.amount.toString() : "",
    },
  });

  // Función para comprimir y convertir la imagen a Base64
  const compressAndConvertToBase64 = async (file: File): Promise<string> => {
    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG y WebP."
      );
    }

    // Validar tamaño (máximo 5MB antes de comprimir)
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`El tamaño de la imagen no debe exceder ${maxSizeMB}MB.`);
    }

    // Opciones de compresión
    const options = {
      maxSizeMB: 1, // Tamaño máximo después de comprimir
      maxWidthOrHeight: 1200, // Dimensión máxima
      useWebWorker: true,
      fileType: file.type,
    };

    try {
      // Comprimir la imagen
      const compressedFile = await imageCompression(file, options);

      // Convertir a Base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Extraer solo la parte Base64, eliminando "data:image/jpeg;base64,"
          const base64Data = base64String.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error("Error al comprimir la imagen:", error);
      throw new Error(
        "Error al procesar la imagen. Por favor, intenta con otra imagen."
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    try {
      // Crear URL para vista previa
      const imageUrl = URL.createObjectURL(file);
      setTempImageUrl(imageUrl);
      setImageType(file.type); // Guardar el tipo MIME

      // Comprimir y convertir a Base64
      const base64Data = await compressAndConvertToBase64(file);
      setImageBase64(base64Data);
    } catch (error) {
      setImageError((error as Error).message);
      setTempImageUrl(null);
      setImageBase64(null);
      setImageType(null);

      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (data: FormValues) => {
    if (imageError) {
      return; // No permitir envío si hay error de imagen
    }

    setIsLoading(true);
    try {
      await onSubmit({
        ...data,
        image: imageBase64,
        imageType: imageType, // Enviar el tipo MIME
      });
      form.reset();
      setTempImageUrl(null);
      setImageBase64(null);
      setImageType(null);
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
            {isEditing ? "Editar pago" : "Crear nuevo pago"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza los detalles del pago"
              : "Ingresa los detalles del nuevo pago"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Categoría</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            "w-full justify-between h-10 px-3 py-2 text-sm",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          {field.value
                            ? field.value
                            : "Selecciona una categoría"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command className="w-full">
                        <CommandInput
                          className="my-2 px-1 h-9"
                          placeholder="Buscar categoría..."
                        />
                        <CommandEmpty>
                          No se encontraron categorías.
                          <p className="text-xs text-muted-foreground mt-1">
                            Escribe para crear una nueva.
                          </p>
                        </CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={() => {
                                form.setValue("category", category);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  category === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {category}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <div className="p-2 border-t">
                          <Input
                            placeholder="O escribe una nueva categoría"
                            className="h-9"
                            value={
                              !categories.includes(field.value)
                                ? field.value
                                : ""
                            }
                            onChange={(e) => {
                              field.onChange(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (field.value && field.value.trim() !== "") {
                                  setOpen(false);
                                }
                              }
                            }}
                          />
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="concept"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: Cuota Semáforo 3"
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <div className="payment-input-wrapper">
                      <span className="payment-input-prefix">S/</span>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        disabled={isLoading}
                        className="payment-input pl-8"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Comprobante</FormLabel>
              <div className="flex items-center justify-center gap-4">
                {!tempImageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-lg"
                    disabled={isLoading}
                    asChild
                  >
                    <label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                        disabled={isLoading}
                      />
                      <Upload className="h-4 w-4" />
                    </label>
                  </Button>
                )}
                {tempImageUrl && (
                  <div className="relative">
                    <div className="relative h-28 w-28 rounded-lg overflow-hidden">
                      <Image
                        src={tempImageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => {
                        setTempImageUrl(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
                  : "Crear pago"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
