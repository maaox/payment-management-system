"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

type ImagePreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title?: string;
};

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageSrc,
  title = "Vista previa",
}: ImagePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-square w-full rounded-lg overflow-hidden">
          {imageSrc ? (
            <Image 
              src={imageSrc} 
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