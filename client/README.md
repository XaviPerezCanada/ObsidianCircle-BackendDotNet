# 🎲 Obsidian Circle - Tabletop RPG Companion

Una aplicación web moderna para gestionar tus aventuras de rol de mesa. Construida con React + Vite en el frontend y Express + SQLite en el backend, siguiendo principios de Clean Architecture.

## ✨ Características

- 🔐 **Autenticación completa** con JWT tokens
- 👤 **Gestión de usuarios** con registro e inicio de sesión
- 🎨 **UI moderna** con Tailwind CSS y componentes shadcn/ui
- 🌙 **Tema oscuro/claro** con soporte del sistema
- 📱 **Diseño responsive** para móvil y escritorio
- 🏗️ **Clean Architecture** en el backend
- 💾 **Base de datos SQLite** para desarrollo rápido

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o pnpm

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/obsidian-circle.git
cd obsidian-circle
```

2. **Instalar dependencias del frontend**
```bash
npm install
```

3. **Instalar dependencias del backend**
```bash
cd backendExpress
npm install
cd ..
```

4. **Configurar variables de entorno del backend**

Crea un archivo `backendExpress/.env`:
```env
PORT=3001
JWT_SECRET=tu-clave-secreta-super-segura-cambiar-en-produccion
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Ejecutar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd backendExpress
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173` (o el puerto que Vite asigne) y el backend en `http://localhost:3001`.

## 📁 Estructura del Proyecto

```
ObsidianCircleFinal/
├── src/                    # Frontend React + Vite
│   ├── components/         # Componentes React
│   ├── context/           # Context API (Auth)
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilidades
│   ├── routes/            # Rutas y guards
│   └── services/         # Servicios API
├── backendExpress/        # Backend Express + SQLite
│   ├── src/
│   │   ├── domain/       # Capa de dominio
│   │   ├── application/  # Casos de uso
│   │   ├── infrastructure/ # Repositorios, servicios
│   │   └── presentation/  # Controllers, routes
│   └── data/             # Base de datos SQLite
├── components/            # Componentes UI compartidos
└── public/               # Archivos estáticos
```

## 🛠️ Tecnologías

### Frontend
- **React 19** - Biblioteca UI
- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Zod** - Validación

### Backend
- **Express** - Framework web
- **SQLite** - Base de datos
- **TypeScript** - Tipado estático
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Zod** - Validación de DTOs

## 📝 Scripts Disponibles

### Frontend
- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Preview de producción
- `npm run lint` - Ejecuta ESLint

### Backend
- `npm run dev` - Inicia servidor con hot reload
- `npm run build` - Compila TypeScript
- `npm start` - Ejecuta versión compilada
- `npm run migrate` - Ejecuta migraciones de BD

## 🔐 API Endpoints

- `POST /api/usuarios/register` - Registro de usuario
- `POST /api/usuarios/login` - Inicio de sesión
- `GET /health` - Health check

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Tu nombre aquí

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
