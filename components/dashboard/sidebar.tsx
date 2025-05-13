"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  CreditCard,
  LogOut,
  Menu,
  X,
  User,
  UserCircle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
};

const navItems: NavItem[] = [
  {
    title: "Colaboradores",
    href: "/dashboard/users/collaborators",
    icon: <UserCheck className="h-5 w-5" />,
    roles: ["ADMIN"],
  },
  {
    title: "Clientes",
    href: "/dashboard/users/clients",
    icon: <User className="h-5 w-5" />,
    roles: ["ADMIN", "COLLABORATOR"],
  },
  {
    title: "Mis Pagos",
    href: "/dashboard/my-payments",
    icon: <CreditCard className="h-5 w-5" />,
    roles: ["CLIENT"],
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const dictionaryRoles = {
    ADMIN: "Administrador",
    COLLABORATOR: "Colaborador",
    CLIENT: "Cliente",
    USER: "Usuario",
  };

  
  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          className="rounded-full shadow-md"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-card shadow-lg w-64 transition-transform duration-300 border-r",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-center gap-3">
            <div className="flex justify-center items-center rounded-full border-2 border-primary h-12 w-12">
              <Image
                src="/images/tesis20-logo.png"
                alt="Logo"
                className="h-7 w-7"
                width={64}
                height={64}
              />
            </div>
            <h1 className="text-lg font-bold">Gestión de Pagos</h1>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <UserCircle className="h-10 w-10 text-primary" />
              <div>
                <h2 className="font-medium">{user?.name || "Usuario"}</h2>
                <p className="text-xs text-muted-foreground">
                  {dictionaryRoles[user?.role || "USER"]}
                </p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("nav-link", pathname === item.href && "active")}
                onClick={() => setIsOpen(false)}
                aria-label={item.title}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              onClick={logout}
              className="w-full flex items-center gap-2 justify-center"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
