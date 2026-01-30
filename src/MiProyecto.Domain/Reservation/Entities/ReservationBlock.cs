using MiProyecto.Domain.Reservation;


namespace MiProyecto.Domain.Reservation.Entities
{
    public class ReservationBlock
    {
        public Guid Id { get; private set; }

        public Guid ReservationId { get; private set; }
        public Guid GameRoomId { get; private set; }

        public DateOnly Date { get; private set; }
        public BlockSlot Bloque { get; private set; }

        protected ReservationBlock() { } // EF

        internal ReservationBlock(Guid reservationId, Guid gameRoomId, DateOnly date, BlockSlot bloque)
        {
            Id = Guid.NewGuid();
            ReservationId = reservationId;
            GameRoomId = gameRoomId;
            Date = date;
            Bloque = bloque;
        }
    }
}
