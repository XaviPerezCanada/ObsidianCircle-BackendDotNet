import { useState, useRef } from 'react';
import Agenda from "../components/agenda/Agenda";
import Gameroom from "../components/gamerooms/Gameroom";
import BookingModal from "../components/bookings/BookingModal";
import { useGamerooms } from '../components/gamerooms/hooks';
import type { GameRoomResponseDto } from '../components/gamerooms/gameroomService.param';

export const Home = () => {
  const [selectedGameRoomId, setSelectedGameRoomId] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedGameRoomForBooking, setSelectedGameRoomForBooking] = useState<GameRoomResponseDto | null>(null);
  const agendaRefetchRef = useRef<(() => Promise<void>) | null>(null);
  const { gamerooms } = useGamerooms();

  const handleGameRoomSelect = (gameRoomId: number | null) => {
    setSelectedGameRoomId(gameRoomId);
  };

  const handleReserveClick = (gameRoomId: number) => {
    const gameRoom = gamerooms.find(room => room.id === gameRoomId);
    if (gameRoom) {
      setSelectedGameRoomForBooking(gameRoom);
      setSelectedGameRoomId(gameRoomId);
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingCreated = async () => {
    // Actualizar la Agenda después de crear la reserva
    if (agendaRefetchRef.current) {
      await agendaRefetchRef.current();
    }
  };

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <h1 className="text-2xl font-bold">Zona de Reservas</h1>
      <div className="flex flex-row w-full h-full gap-4">
        <Agenda 
          selectedGameRoomId={selectedGameRoomId}
          gamerooms={gamerooms}
          onGameRoomChange={handleGameRoomSelect}
          onRefetchReady={(refetch) => {
            agendaRefetchRef.current = refetch;
          }}
        />
        <Gameroom 
          onReserveClick={handleReserveClick}
        />
      </div>

      {/* Modal para crear reserva desde el botón */}
      <BookingModal
        open={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        gameRoom={selectedGameRoomForBooking}
        onBookingCreated={handleBookingCreated}
      />
    </div>
  );
};