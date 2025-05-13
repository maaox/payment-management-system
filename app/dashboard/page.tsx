"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { USER_ROLES } from "@/lib/utils";
import { CreditCard, Users, UserCheck } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on role
    if (user) {
      if (user.role === USER_ROLES.ADMIN) {
        router.push("/dashboard/users/collaborators");
      } else if (user.role === USER_ROLES.COLLABORATOR) {
        router.push("/dashboard/users/clients");
      } else if (user.role === USER_ROLES.CLIENT) {
        router.push("/dashboard/my-payments");
      }
    }
  }, [user, router]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Panel de control</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user?.role === USER_ROLES.ADMIN && (
          <Card className="shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Colaboradores
              </CardTitle>
              <UserCheck className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gestiona los colaboradores del sistema
              </CardDescription>
            </CardContent>
          </Card>
        )}

        {(user?.role === USER_ROLES.ADMIN ||
          user?.role === USER_ROLES.COLLABORATOR) && (
          <Card className="shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Clientes</CardTitle>
              <Users className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Administra los clientes y sus pagos
              </CardDescription>
            </CardContent>
          </Card>
        )}

        {user?.role === USER_ROLES.CLIENT && (
          <Card className="shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Mis Pagos</CardTitle>
              <CreditCard className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <CardDescription>Visualiza y gestiona tus pagos</CardDescription>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Serás redirigido a tu módulo principal en breve...</p>
      </div>
    </div>
  );
}
