# 📥 Comandos Git - Pull y Actualización

## 🔄 Hacer Pull (Descargar cambios desde GitHub)

### Pull básico
```bash
git pull
```

Este comando descarga los cambios desde el repositorio remoto y los fusiona automáticamente con tu rama actual.

### Pull con especificar rama
```bash
git pull origin main
```

Descarga cambios específicamente de la rama `main` del remoto `origin`.

### Pull con rebase (mantiene historial más limpio)
```bash
git pull --rebase origin main
```

Descarga cambios y aplica tus commits locales encima de los cambios remotos.

## 📋 Flujo completo de trabajo

### 1. Verificar estado actual
```bash
git status
```

Muestra qué archivos han cambiado y si hay cambios sin commitear.

### 2. Ver cambios remotos antes de hacer pull
```bash
git fetch
git log HEAD..origin/main
```

Descarga información de cambios remotos sin fusionarlos, y muestra qué commits hay en remoto que no tienes localmente.

### 3. Hacer pull
```bash
git pull origin main
```

### 4. Si hay conflictos

Si Git no puede fusionar automáticamente, verás un mensaje de conflicto:

```bash
# Git te mostrará qué archivos tienen conflictos
git status

# Edita los archivos con conflictos (busca las marcas <<<<<<<)
# Luego marca como resueltos:
git add archivo-con-conflicto.tsx

# Completa la fusión:
git commit
```

## 🔀 Diferentes escenarios

### Escenario 1: Primera vez clonando un repositorio
```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO
```

### Escenario 2: Ya tienes el repo local, quieres actualizar
```bash
git pull origin main
```

### Escenario 3: Tienes cambios locales sin commitear
```bash
# Opción A: Guardar cambios temporalmente
git stash
git pull origin main
git stash pop  # Restaura tus cambios

# Opción B: Hacer commit primero
git add .
git commit -m "Mis cambios locales"
git pull origin main
```

### Escenario 4: Trabajando en una rama diferente
```bash
# Cambiar a la rama
git checkout nombre-rama

# Hacer pull de esa rama
git pull origin nombre-rama
```

## 📊 Comandos útiles relacionados

### Ver diferencias antes de hacer pull
```bash
git fetch
git diff HEAD origin/main
```

### Ver qué ramas hay en remoto
```bash
git branch -r
```

### Actualizar todas las ramas remotas
```bash
git fetch --all
```

### Ver el historial de commits
```bash
git log --oneline --graph --all
```

## ⚠️ Errores comunes y soluciones

### Error: "Your local changes would be overwritten"
**Solución:**
```bash
# Guarda tus cambios temporalmente
git stash

# Haz pull
git pull origin main

# Restaura tus cambios
git stash pop
```

### Error: "Failed to push some refs"
**Solución:**
```bash
# Primero haz pull para obtener cambios remotos
git pull origin main

# Luego intenta push de nuevo
git push origin main
```

### Error: "Merge conflict"
**Solución:**
1. Abre los archivos con conflictos
2. Busca las marcas `<<<<<<<`, `=======`, `>>>>>>>`
3. Decide qué código mantener
4. Elimina las marcas de conflicto
5. Guarda el archivo
6. Ejecuta:
```bash
git add archivo-resuelto.tsx
git commit
```

## 🎯 Flujo recomendado diario

```bash
# 1. Ver qué cambios hay en remoto
git fetch

# 2. Ver diferencias
git status

# 3. Hacer pull si hay cambios
git pull origin main

# 4. Trabajar en tus cambios...

# 5. Cuando termines, hacer commit y push
git add .
git commit -m "Descripción de cambios"
git push origin main
```
