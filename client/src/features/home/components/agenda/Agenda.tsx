import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import type { View, Event as CalendarEvent } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; 
import 'react-big-calendar/lib/css/react-big-calendar.css'; 
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { useBookingsByGameRoom } from '../bookings/hooks';
import { Spin, Alert, Select, Flex } from 'antd';
import BookingModal from '../bookings/BookingModal';
import type { GameRoomResponseDto } from '../gamerooms/gameroomService.param';
import type { BookingResponseDto } from '../bookings/bookingService.param';

dayjs.locale('es');
const localizer = dayjsLocalizer(dayjs);

interface AgendaProps {
  selectedGameRoomId?: number | null;
  gamerooms?: GameRoomResponseDto[];
  onGameRoomChange?: (gameRoomId: number | null) => void;
  onRefetchReady?: (refetch: () => Promise<void>) => void;
}

const Agenda: React.FC<AgendaProps> = ({ 
  selectedGameRoomId = null, 
  gamerooms = [],
  onGameRoomChange,
  onRefetchReady
}) => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Cargar reservas de la sala seleccionada
  const { bookings, loading, error, refetch } = useBookingsByGameRoom(selectedGameRoomId || null);

  // Obtener la sala seleccionada
  const selectedGameRoom = useMemo(() => {
    return gamerooms.find(room => room.id === selectedGameRoomId) || null;
  }, [gamerooms, selectedGameRoomId]);

  // Convertir reservas a eventos del calendario
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return [];
    }

    return bookings.map((booking: BookingResponseDto) => ({
      id: booking.id,
      title: booking.titulo,
      start: new Date(booking.fecha_inicio),
      end: new Date(booking.fecha_fin),
      resource: {
        bookingId: booking.id,
        descripcion: booking.descripcion,
        usuario: booking.usuario,
      },
    }));
  }, [bookings]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (!selectedGameRoomId) {
      return;
    }
    setSelectedSlot({ start, end });
    setIsModalOpen(true);
  };

  const handleBookingCreated = async () => {
    await refetch(); // Recargar las reservas después de crear una nueva
  };

  // Exponer refetch al componente padre
  useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(async () => {
        await refetch();
      });
    }
  }, [refetch, onRefetchReady]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  return (
    <>
      <style>{`
        .rbc-today {
          background-color: #2a2a2a !important;
        }
        .rbc-current-time-indicator {
          background-color: #4a4a4a;
        }
        .rbc-off-range-bg {
          background-color: #1a1a1a;
        }
        .rbc-day-bg.rbc-today {
          background-color:rgb(49, 54, 48) !important;
        }
        .rbc-time-slot.rbc-today {
          background-color: #2a2a2a !important;
        }
        .rbc-event {
          background-color: #696FC7 !important;
          border-color: #A7AAE1 !important;
          color: #E8E8E8 !important;
        }
        .rbc-event:focus {
          outline: 2px solid #A7AAE1 !important;
        }
        /* Hover effect para las casillas de los días en vista mensual */
        .rbc-month-view .rbc-day-bg {
          transition: background-color 0.2s ease;
          cursor: pointer;
        }
        .rbc-month-view .rbc-day-bg:hover {
          background-color: #353535 !important;
        }
        .rbc-month-view .rbc-day-bg.rbc-today:hover {
          background-color: #3a3a3a !important;
        }
        .rbc-month-view .rbc-day-bg.rbc-off-range-bg:hover {
          background-color: #252525 !important;
        }
      `}</style>
      <Flex vertical gap="middle" style={{ width: '100%', height: '100%' }}>
        {/* Selector de sala */}
        {gamerooms.length > 0 && (
          <Select
            placeholder="Selecciona una sala para ver sus reservas"
            value={selectedGameRoomId}
            onChange={(value) => onGameRoomChange?.(value)}
            style={{ width: '100%' }}
            size="large"
            options={gamerooms.map((room) => ({
              label: room.nombre,
              value: room.id,
            }))}
          />
        )}

        {error && (
          <Alert
            message="Error al cargar las reservas"
            description={error}
            type="error"
            showIcon
            style={{
              backgroundColor: '#2a1a1a',
              border: '1px solid #ff4d4f',
              color: '#ffccc7',
            }}
          />
        )}

        {loading && (
          <Flex justify="center" align="center" style={{ minHeight: 200 }}>
            <Spin size="large" />
          </Flex>
        )}

        {!loading && !error && (
          <div className="w-full h-full p-4 bg-[#1F1F1F] rounded-lg shadow-md">
            {selectedGameRoomId ? (
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                views={["month", "week", "day"]}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                onSelectSlot={handleSelectSlot}
                selectable
                style={{ height: '100%' }}
                messages={{
                  next: <RightOutlined />,
                  previous: <LeftOutlined />,
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                  agenda: "Agenda",
                  date: "Fecha",
                  time: "Hora",
                  event: "Evento",
                  noEventsInRange: "Sin eventos",
                }}
              />
            ) : (
              <Flex justify="center" align="center" style={{ height: '100%', color: '#B0B0B0' }}>
                {gamerooms.length > 0 
                  ? "Selecciona una sala para ver sus reservas" 
                  : "No hay salas disponibles"}
              </Flex>
            )}
          </div>
        )}

        {/* Modal para crear reservas */}
        <BookingModal
          open={isModalOpen}
          onClose={handleModalClose}
          gameRoom={selectedGameRoom}
          selectedStartDate={selectedSlot?.start}
          selectedEndDate={selectedSlot?.end}
          onBookingCreated={handleBookingCreated}
        />
      </Flex>
    </>
  );
};

export default Agenda;