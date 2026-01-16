from fastapi import FastAPI
from infrastructure.database.database import engine, Base
from api.controllers.GameRoomController import router as game_room_router

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear la instancia de la aplicación
app = FastAPI(
    title="GameRoom API",
    description="API para gestionar salas de juegos",
    version="1.0.0"
)

# Incluir los routers
app.include_router(game_room_router)

# Definir una ruta básica (endpoint)
@app.get("/")
def read_root():
    return {"mensaje": "¡Hola, mundo desde FastAPI!", "version": "1.0.0"}