/**
 * Barrel export para facilitar las importaciones
 * Estructura CQRS: Commands y Queries separados
 */

// Commands - Operaciones de escritura
export { gameRoomCommands } from './command/commandGameRooms'
export { testGameRooms } from './command/commandGameRooms'

// Queries - Operaciones de lectura
export { gameRoomQueries } from './queries/queriesGameRooms'
