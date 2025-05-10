import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  COLLABORATOR: 'COLLABORATOR',
  CLIENT: 'CLIENT',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export type User = {
  id: string;
  dni: string;
  name: string;
  username: string;
  role: UserRole;
};

export type Payment = {
  id: string;
  category: string;
  concept: string;
  amount: number;
  imageSrc: string | null;
  clientId: string;
  createdAt: Date;
};

export type Client = User & {
  totalPaid: number;
  payments: Payment[];
};

export function formatCurrency(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}

// Mock data for initial development
export const MOCK_USERS: User[] = [
  { id: '1', dni: '12345678', name: 'Jorge Carrera', username: 'admin', role: 'ADMIN' },
  { id: '2', dni: '23456789', name: 'John Buster', username: 'colaborador1', role: 'COLLABORATOR' },
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: '4',
    dni: '45678901',
    name: 'Juam Martínez',
    username: 'cliente1',
    role: 'CLIENT',
    totalPaid: 1500,
    payments: [
      {
        id: '1',
        category: 'Semáforo',
        concept: 'Cuota Semáforo 3',
        amount: 500,
        imageSrc: "https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        clientId: '4',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        category: 'Semáforo',
        concept: 'Cuota Semáforo 2',
        amount: 500,
        imageSrc: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?q=80&w=2400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        clientId: '4',
        createdAt: new Date('2024-02-15'),
      },
      {
        id: '3',
        category: 'Adelanto',
        concept: 'Adelanto Enero',
        amount: 500,
        imageSrc: null,
        clientId: '4',
        createdAt: new Date('2024-03-15'),
      },
    ]
  },
  {
    id: '5',
    dni: '56789012',
    name: 'Inés Pérez',
    username: 'cliente2',
    role: 'CLIENT',
    totalPaid: 2500,
    payments: [
      {
        id: '4',
        category: 'Semáforo',
        concept: 'Cuota Semáforo 1',
        amount: 1000,
        imageSrc: null,
        clientId: '5',
        createdAt: new Date('2024-01-20'),
      },
      {
        id: '5',
        category: 'Adelanto',
        concept: 'Adelanto Febrero',
        amount: 1500,
        imageSrc: null,
        clientId: '5',
        createdAt: new Date('2024-02-20'),
      },
    ]
  },
];