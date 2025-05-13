import * as bcrypt from 'bcrypt';

/**
 * Compara una contraseña en texto plano con un hash
 * @param plainPassword Contraseña en texto plano
 * @param hashedPassword Hash de la contraseña almacenada
 * @returns Promesa que resuelve a true si coinciden, false en caso contrario
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Error al comparar contraseñas:", error);
    return false;
  }
}

/**
 * Genera un hash para una contraseña
 * @param password Contraseña en texto plano
 * @returns Promesa que resuelve al hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}