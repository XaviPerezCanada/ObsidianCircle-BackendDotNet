from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infrastructure.database.database import engine, Base
from api.controllers.GameRoomController import router as game_room_router
from api.controllers.BookingController import router as booking_router

# Importar modelos para que SQLAlchemy los registre
from infrastructure.database.models import GameRoomModel, BookingModel

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear la instancia de la aplicación
app = FastAPI(
    title="GameRoom API",
    description="API para gestionar salas de juegos",
    version="1.0.0"
)

# Configurar CORS para permitir comunicación con React
# IMPORTANTE: CORS debe configurarse ANTES de incluir los routers
# Para desarrollo: permitir todos los orígenes (cambiar en producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes durante desarrollo
    allow_credentials=False,  # Debe ser False cuando allow_origins=["*"]
    allow_methods=["*"],  # Permite todos los métodos
    allow_headers=["*"],  # Permite todos los headers
)

# Incluir los routers
app.include_router(game_room_router)
app.include_router(booking_router)

# Definir una ruta básica (endpoint)
@app.get("/")
def read_root():
    return {"mensaje": "¡Hola, mundo desde FastAPI!", "version": "1.0.0"}