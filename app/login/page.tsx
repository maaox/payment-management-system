"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de campos vacíos
    if (!username.trim()) {
      toast.error("Por favor, ingresa tu nombre de usuario");
      return;
    }
    
    if (!password) {
      toast.error("Por favor, ingresa tu contraseña");
      return;
    }

    setIsLoading(true);
    
    try {
      // Mostrar toast de carga
      const loadingToast = toast.loading("Iniciando sesión...");
      
      const success = await login(username, password);
      
      // Eliminar toast de carga
      toast.dismiss(loadingToast);
      
      if (success) {
        toast.success("¡Bienvenido al sistema!");
        router.push("/dashboard");
      } else {
        toast.error("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error de inicio de sesión:", err);
      toast.error("Error al conectar con el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md animate-scale-in">
        <Card className="shadow-xl rounded-2xl">
          <CardHeader className="items-center space-y-2 text-center">
            <div className="flex justify-center items-center rounded-full border-4 border-primary h-28 w-28">
              <Image
                src="/images/tesis20-logo.png"
                alt="Logo"
                className="h-20 w-20"
                width={64}
                height={64}
              />
            </div>
            <CardTitle className="text-2xl font-bold">
              Sistema de Gestión
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Usuario
                </label>
                <Input
                  id="username"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  aria-label="Nombre de usuario"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  aria-label="Contraseña"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                aria-label="Ingresar"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Ingresar"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Ingresa con tus credenciales de usuario</p>
        </div>
      </div>
    </div>
  );
}
