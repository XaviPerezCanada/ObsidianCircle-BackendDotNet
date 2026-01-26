using MiProyecto.Domain.BoardGames.Exceptions;

namespace MiProyecto.Domain.GameRooms.Entities

{
    public class GameRoom
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }= string.Empty;

        public string Slug { get; private set; } = string.Empty;

        public string Description { get; private set; } = string.Empty;


        public int Capacity { get; private set; }
        public RoomStatus Status { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public enum RoomStatus
        {
            Active,
            Inactive,
            UnderMaintenance
        }

        // Constructor sin parámetros para Entity Framework
        protected GameRoom() { }

        // Constructor para garantizar un estado válido al crear
        public GameRoom(string name, string slug, int capacity, string description )
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("El nombre de la sala no puede estar vacío.", nameof(name));

            if (capacity <= 0)
                throw new ArgumentException("La capacidad debe ser un número positivo.", nameof(capacity));

            Id = Guid.NewGuid();
            Name = name;
            SetSlug(slug);
            Description = description;
            Capacity = capacity;
            Status = RoomStatus.Active;
            CreatedAt = DateTime.UtcNow;
        }

        // Método de dominio (ejemplo opcional): Cambiar estado
        public void SetMaintenanceMode()
        {
            Status = RoomStatus.UnderMaintenance;
        }

        private void SetSlug(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug))
                throw new DomainException("Slug inválido.");

            Slug = slug.Trim();
        }   
        public void Update(string name, int capacity)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("El nombre no puede estar vacío.");
            if (capacity <= 0)
                throw new ArgumentException("La capacidad debe ser positiva.");

            Name = name;
            Capacity = capacity;
            
           
            // Opcional: Actualizar una fecha de 'ModifiedAt'
        }
    }

}