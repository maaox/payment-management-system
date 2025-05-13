"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useEffect, useState } from "react";

type ImagePreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  imageType: string;
  title?: string;
};

export function ImagePreviewModal({
  isOpen,
  onClose,
  image,
  imageType,
  title = "Vista previa",
}: ImagePreviewModalProps) {
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  // Actualizar imageUrl cuando cambia image o imageType
  useEffect(() => {
    if (image && imageType) {
      const mimeType = imageType || "image/jpeg";
      const imageUrl = `data:${mimeType};base64,${image}`;
      setTempImageUrl(imageUrl);
    }
  }, [image, imageType]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-square w-full rounded-lg overflow-hidden">
          {image ? (
            <Image
              src={tempImageUrl || "images/tesis20-logo.png"}
              alt="Payment proof"
              fill
              className="object-contain"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No hay imagen disponible</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
