# 📤 Guía para Subir el Proyecto a GitHub

## Pasos para subir tu proyecto a GitHub

### 1. Crear el repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** en la esquina superior derecha
3. Selecciona **"New repository"**
4. Completa:
   - **Repository name**: `obsidian-circle` (o el nombre que prefieras)
   - **Description**: "Tabletop RPG Companion - React + Express + SQLite"
   - **Visibility**: Public o Private (tu elección)
   - **NO marques** "Initialize with README" (ya tenemos uno)
5. Haz clic en **"Create repository"**

### 2. Conectar tu repositorio local con GitHub

Ejecuta estos comandos en tu terminal (reemplaza `TU_USUARIO` y `TU_REPO` con tus datos):

```bash
# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit: Obsidian Circle - Tabletop RPG Companion"

# Agregar el repositorio remoto (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Cambiar a la rama main (si es necesario)
git branch -M main

# Subir el código
git push -u origin main
```

### 3. Comandos rápidos (copia y pega)

```bash
git add .
git commit -m "Initial commit: Obsidian Circle - Tabletop RPG Companion"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### 4. Si ya tienes un repositorio remoto configurado

Si ya ejecutaste los comandos anteriores y solo quieres actualizar:

```bash
git add .
git commit -m "Descripción de tus cambios"
git push
```

## 📝 Notas Importantes

- **NO subas archivos `.env`** - Ya están en `.gitignore`
- **NO subas `node_modules`** - Ya están en `.gitignore`
- **NO subas bases de datos** - Los archivos `.db` están ignorados
- El archivo `.gitignore` ya está configurado para excluir archivos sensibles

## 🔐 Variables de Entorno

Recuerda que los archivos `.env` NO se suben a GitHub por seguridad. Si alguien clona tu proyecto, necesitará crear su propio `.env` basándose en `.env.example` (si lo creas).

## ✅ Verificación

Después de hacer `git push`, verifica en GitHub que:
- ✅ Todos los archivos están subidos
- ✅ El README.md se muestra correctamente
- ✅ No hay archivos sensibles (`.env`, `node_modules`, etc.)
