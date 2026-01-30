using MiProyecto.Domain.Reservation;

namespace MiProyecto.Domain.Reservation.Entities
{
    public class Reservation
    {
        public Guid Id { get; private set; }
        public Guid GameRoomId { get; private set; }
        public Guid UserId { get; private set; }

        public DateOnly Date { get; private set; }
        public TimeSlot Franja { get; private set; }

        public int? BoardGameId { get; private set; }
        public ReservationStatus Estado { get; private set; }

        public DateTime CreatedAt { get; private set; }
        public DateTime? ModifiedAt { get; private set; }

        public ICollection<ReservationBlock> Blocks { get; private set; } = new List<ReservationBlock>();

        protected Reservation() { }

        public Reservation(Guid gameRoomId, Guid userId, DateOnly date, TimeSlot franja, int? boardGameId = null)
        {
            if (gameRoomId == Guid.Empty) throw new ArgumentException("Sala inválida.");
            if (userId == Guid.Empty) throw new ArgumentException("Usuario inválido.");

            Id = Guid.NewGuid();
            GameRoomId = gameRoomId;
            UserId = userId;
            Date = date;
            Franja = franja;
            BoardGameId = boardGameId;

            Estado = ReservationStatus.Active;
            CreatedAt = DateTime.UtcNow;

            foreach (var block in ToBlocks(franja))
                Blocks.Add(new ReservationBlock(Id, gameRoomId, date, block));
        }

        public void Cancelar()
        {
            if (Estado == ReservationStatus.Cancelled) return;
            Estado = ReservationStatus.Cancelled;
            ModifiedAt = DateTime.UtcNow;
        }

        private static IEnumerable<BlockSlot> ToBlocks(TimeSlot franja) => franja switch
        {
            TimeSlot.Morning => new[] { BlockSlot.Morning },
            TimeSlot.Afternoon => new[] { BlockSlot.Afternoon },
            TimeSlot.Night => new[] { BlockSlot.Night },
            TimeSlot.FullDay => new[] { BlockSlot.Morning, BlockSlot.Afternoon, BlockSlot.Night },
            _ => throw new ArgumentOutOfRangeException(nameof(franja))
        };
    }
}
