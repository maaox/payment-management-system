# Sistema de Gestión de Pagos

Un sistema moderno para la gestión de pagos, clientes y colaboradores, desarrollado con Next.js y Prisma ORM y SQLite.

![Sistema de Gestión de Pagos](https://via.placeholder.com/1200x600?text=Sistema+de+Gesti%C3%B3n+de+Pagos)

## 📋 Características

- **Gestión de Clientes**: Registro, edición y administración de clientes.
- **Gestión de Colaboradores**: Control de usuarios con diferentes roles y permisos.
- **Registro de Pagos**: Creación y seguimiento de pagos con comprobantes.
- **Categorización**: Organización de pagos por categorías personalizables.
- **Visualización de Comprobantes**: Vista previa de imágenes de comprobantes de pago.
- **Interfaz Responsiva**: Diseño adaptable a diferentes dispositivos.

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js, React, TypeScript
- **UI/UX**: Tailwind CSS, Radix UI, Shadcn UI
- **Formularios**: React Hook Form, Zod
- **Componentes**: Dialog, Popover, Command, Avatar, etc.

## 🛠️ Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/maaox/payment-management-system.git
   cd payment-management-system
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   pnpm dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Uso

### Gestión de Clientes

- Registra nuevos clientes con información básica (DNI, nombre, usuario, contraseña)
- Visualiza y edita la información de clientes existentes
- Accede al historial de pagos de cada cliente

### Gestión de Pagos

- Crea nuevos pagos asociados a clientes
- Categoriza los pagos para mejor organización
- Adjunta comprobantes de pago como imágenes
- Visualiza, edita o elimina pagos existentes

### Gestión de Colaboradores

- Administra usuarios del sistema con diferentes niveles de acceso
- Asigna roles específicos a cada colaborador

## 🔧 Estructura del Proyecto

```
payment-management-system/
├── components/           # Componentes React
│   ├── modals/           # Ventanas modales (confirmación, vista previa)
│   ├── payments/         # Componentes relacionados con pagos
│   ├── ui/               # Componentes de interfaz reutilizables
│   └── users/            # Componentes para gestión de usuarios
├── lib/                  # Utilidades y funciones auxiliares
├── public/               # Archivos estáticos
└── ...
```

## 🤝 Contribución

1. Haz un Fork del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`)
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE).

## 📞 Contacto

Para preguntas o soporte, por favor contacta a [maaox.dev@gmail.com](mailto:maaox.dev@gmail.com).
