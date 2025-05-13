"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { User } from "./utils";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import * as jose from 'jose';
import { LoadingSpinner } from "@/components/loading-spinner";
import { loginUser, getUser } from "@/lib/api-service";

// Obtener la clave secreta de las variables de entorno
// En desarrollo, usa un valor predeterminado si no está definido
const JWT_SECRET_KEY = process.env.NEXT_PUBLIC_JWT_SECRET || "payment-management-system-secret-key";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_KEY);

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Función para codificar el token JWT usando jose
  const encodeToken = async (user: User): Promise<string> => {
    const jwt = await new jose.SignJWT({ id: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
    return jwt;
  };

  // Función para decodificar el token JWT usando jose
  const decodeToken = async (token: string): Promise<{ id: string; role: string } | null> => {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      return payload as { id: string; role: string };
    } catch (error) {
      console.error("Error al verificar el token:", error);
      return null;
    }
  };

  useEffect(() => {
    // Verificar token en cookies al cargar
    const checkToken = async () => {
      const token = Cookies.get("auth_token");
      
      if (token) {
        const decodedToken = await decodeToken(token);
        
        if (decodedToken) {
          try {
            // Obtener el usuario desde la API usando el ID del token
            const response = await getUser(decodedToken.id);
            
            if (response.error) {
              console.error("Error al obtener usuario:", response.error);
              Cookies.remove("auth_token");
            } else if (response.data) {
              // Transformar datos de la API al formato de usuario
              const userData: User = {
                id: response.data.id,
                code: response.data.code,
                name: response.data.name,
                username: response.data.username,
                role: response.data.role,
                // Agregar otros campos según sea necesario
              };
              
              setUser(userData);
            } else {
              // Si no hay datos, eliminar la cookie
              Cookies.remove("auth_token");
            }
          } catch (error) {
            console.error("Error al verificar usuario:", error);
            Cookies.remove("auth_token");
          }
        } else {
          // Si el token no es válido, eliminar la cookie
          Cookies.remove("auth_token");
        }
      }
      
      // Finalizar carga
      setIsLoading(false);
    };
    
    checkToken();
  }, []);

  useEffect(() => {
    // Manejar redirecciones basadas en el estado de autenticación
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        router.push("/login");
      } else if (user && pathname === "/login") {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, pathname, router]);

  // Función de inicio de sesión conectada a la API
  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Llamar a la API de login
      const response = await loginUser({ username, password });
      
      if (response.error) {
        console.error("Error de autenticación:", response.error);
        return false;
      }
      
      if (response.data && response.data.token) {
        // Guardar token en cookie
        Cookies.set("auth_token", response.data.token, {
          expires: 7, // Expira en 7 días
          path: "/",
          sameSite: "strict",
          // En producción: secure: true
        });
        
        // Obtener datos del usuario
        const userData: User = {
          id: response.data.user.id,
          code: response.data.user.code,
          name: response.data.user.name,
          username: response.data.user.username,
          role: response.data.user.role,
          // Agregar otros campos según sea necesario
        };
        
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoading(true);

    try {
      // Eliminar cookie
      Cookies.remove("auth_token", { path: "/" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error durante el cierre de sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {isLoading ? <LoadingSpinner text="Iniciando sesión..." /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
