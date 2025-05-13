import { Role } from "@prisma/client";

// Tipos
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Función genérica para manejar errores de fetch
async function handleFetchResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error || `Error: ${response.status} ${response.statusText}`;
    return { data: null, error: errorMessage };
  }

  // Para respuestas 204 No Content (como en DELETE)
  if (response.status === 204) {
    return { data: null, error: null };
  }

  const data = await response.json();
  return { data, error: null };
}

// Usuarios
export async function getUser(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    return handleFetchResponse<any>(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    return { data: null, error: "Error de conexión al obtener usuario" };
  }
}

export async function getUsers(role: Role): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch(`/api/users?role=${role}`);
    return handleFetchResponse<any[]>(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    return { data: null, error: "Error de conexión al obtener usuarios" };
  }
}

export async function createUser(userData: any): Promise<ApiResponse<any>> {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleFetchResponse<any>(response);
  } catch (error) {
    console.error("Error creating user:", error);
    return { data: null, error: "Error de conexión al crear usuario" };
  }
}

export async function updateUser(
  id: string,
  userData: any
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleFetchResponse<any>(response);
  } catch (error) {
    console.error("Error updating user:", error);
    return { data: null, error: "Error de conexión al actualizar usuario" };
  }
}

export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });
    return handleFetchResponse<null>(response);
  } catch (error) {
    console.error("Error deleting user:", error);
    return { data: null, error: "Error de conexión al eliminar usuario" };
  }
}

// Pagos
export async function getPayments(
  clientId?: string
): Promise<ApiResponse<any[]>> {
  try {
    const url = clientId
      ? `/api/payments?clientId=${clientId}`
      : "/api/payments";
    const response = await fetch(url);
    return handleFetchResponse<any[]>(response);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { data: null, error: "Error de conexión al obtener pagos" };
  }
}

export async function createPayment(
  paymentData: any
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    console.log({paymentData})
    return handleFetchResponse<any>(response);
  } catch (error) {
    console.error("Error creating payment:", error);
    return { data: null, error: "Error de conexión al crear pago" };
  }
}

export async function updatePayment(
  id: string,
  paymentData: any
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`/api/payments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });
    console.log({paymentData})
    return handleFetchResponse<any>(response);
  } catch (error) {
    console.error("Error updating payment:", error);
    return { data: null, error: "Error de conexión al actualizar pago" };
  }
}

export async function deletePayment(id: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`/api/payments/${id}`, {
      method: "DELETE",
    });
    return handleFetchResponse<null>(response);
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { data: null, error: "Error de conexión al eliminar pago" };
  }
}

// Autenticación
export interface LoginCredentials {
  username: string;
  password: string;
}

export async function loginUser(credentials: LoginCredentials): Promise<ApiResponse<{token: string, user: any}>> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleFetchResponse<{token: string, user: any}>(response);
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    return { data: null, error: "Error de conexión al iniciar sesión" };
  }
}
