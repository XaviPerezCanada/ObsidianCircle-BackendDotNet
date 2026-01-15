from fastapi import FastAPI

# Crear la instancia de la aplicación
app = FastAPI()

# Definir una ruta básica (endpoint)
@app.get("/")
def read_root():
    return {"mensaje": "¡Hola, mundo desde FastAPI!"}

# Definir una ruta con un parámetro
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}