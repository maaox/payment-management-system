"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Por favor, completa todos los campos");
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      setError("Error al iniciar sesión");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
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
                />
              </div>
              {error && (
                <div className="text-destructive text-sm font-medium">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                aria-label="Ingresar"
              >
                Ingresar
              </Button>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Demo: Usa cualquiera de los siguientes usuarios:</p>
          <ol className="list-disc list-inside">
            <li>
              <strong>Administrador</strong>: admin
            </li>
            <li>
              <strong>Colaborador</strong>: colaborador1
            </li>
            <li>
              <strong>Cliente</strong>: cliente1
            </li>
          </ol>
          <p>
            <strong>Contraseña</strong>: Digita cualquier contraseña
          </p>
        </div>
      </div>
    </div>
  );
}
