import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const USER_ROLES = {
  ADMIN: "ADMIN",
  COLLABORATOR: "COLLABORATOR",
  CLIENT: "CLIENT",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type User = {
  id: string;
  code: string;
  name: string;
  username: string;
  role: UserRole;
};

export type Payment = {
  id: string;
  category: string;
  concept: string;
  amount: number;
  image: string | null;
  imageType: string | null;
  clientId: string;
  createdAt: Date;
};

export type Client = User & {
  totalInvestment: number;
  totalPaid: number;
  payments?: Payment[];
};

export function formatCurrency(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}

// Mock data for initial development
export const MOCK_USERS: User[] = [
  {
    id: "1",
    code: "12345678",
    name: "Jorge Carrera",
    username: "admin",
    role: "ADMIN",
  },
  {
    id: "2",
    code: "23456789",
    name: "John Buster",
    username: "colaborador1",
    role: "COLLABORATOR",
  },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: "4",
    code: "45678901",
    name: "Juam Martínez",
    username: "cliente1",
    role: "CLIENT",
    totalInvestment: 3000,
    totalPaid: 1500,
    payments: [
      {
        id: "1",
        category: "Semáforo",
        concept: "Cuota Semáforo 3",
        amount: 500,
        image:null,
        imageType: null,
        clientId: "4",
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        category: "Semáforo",
        concept: "Cuota Semáforo 2",
        amount: 500,
        image:null,
        imageType: null,
        clientId: "4",
        createdAt: new Date("2024-02-15"),
      },
      {
        id: "3",
        category: "Adelanto",
        concept: "Adelanto Enero",
        amount: 500,
        image: null,
        imageType: null,
        clientId: "4",
        createdAt: new Date("2024-03-15"),
      },
    ],
  },
  {
    id: "5",
    code: "56789012",
    name: "Inés Pérez",
    username: "cliente2",
    role: "CLIENT",
    totalInvestment: 4000,
    totalPaid: 2500,
    payments: [
      {
        id: "4",
        category: "Semáforo",
        concept: "Cuota Semáforo 1",
        amount: 1000,
        image: null,
        imageType: null,
        clientId: "5",
        createdAt: new Date("2024-01-20"),
      },
      {
        id: "5",
        category: "Adelanto",
        concept: "Adelanto Febrero",
        amount: 1500,
        image: null,
        imageType: null,
        clientId: "5",
        createdAt: new Date("2024-02-20"),
      },
    ],
  },
];
