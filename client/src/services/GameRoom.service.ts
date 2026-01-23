import { api } from "../api/axios";

export const getGameRooms = async () => {

    const response = await api.get('/game-rooms');
    return response.data;
};

export const createGameRoom = async (gameRoom: GameRoom) => {
    const response = await api.post('/game-rooms', gameRoom);
    return response.data;
};

export const updateGameRoom = async (slug: string, gameRoom: GameRoom) => {
    const response = await api.put(`/game-rooms/${gameRoom.slug}`, gameRoom);
    return response.data;
};

export const deleteGameRoom = async (slug: string) => {
    // no fem un delete,fem un patch per marcar com a deleted = true
    const response = await api.patch(`/game-rooms/${slug}`);
    return response.data;
};

export const getGameRoomBySlug = async (slug: string) => {
    const response = await api.get(`/game-rooms/${slug}`);
    return response.data;
};
