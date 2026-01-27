using MiProyecto.Domain.BoardGames.Exceptions;
using MiProyecto.Domain.Common.ValueObjects; 
namespace MiProyecto.Domain.GameRooms.Entities
{
    public class GameRoom
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = string.Empty;
        public string Slug { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public int Capacity { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? ModifiedAt { get; private set; }

   
        public Status Status { get; private set; }

        
        public bool IsAvailable => Status.IsActive;

        // Constructor para EF Core
        protected GameRoom()
        {
            
            Status = Status.Active;
        }

        public GameRoom(string name, string slug, int capacity, string description)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Nombre vacío.");
            if (capacity <= 0) throw new ArgumentException("Capacidad inválida.");

            Id = Guid.NewGuid();
            Name = name;
            SetSlug(slug);
            Description = description;
            Capacity = capacity;

            // Inicializamos con el estático del Value Object
            Status = Status.Active;

            CreatedAt = DateTime.UtcNow;
        }

        // --- MÉTODOS DE COMPORTAMIENTO ---

        public void Activate()
        {
            // Usamos la propiedad de tu Value Object para chequear
            if (Status.IsActive) return;

            Status = Status.Active;
            UpdateModifiedAt();
        }

        public void Deactivate()
        {
            if (Status.IsInactive) return;

            Status = Status.Inactive;
            UpdateModifiedAt();
        }

        public void SetMaintenanceMode()
        {
            Status = Status.UnderMaintenance;
            UpdateModifiedAt();
        }

        public void Update(string name, int capacity, string description)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Nombre inválido");

            Name = name;
            Capacity = capacity;
            Description = description;
            UpdateModifiedAt();
        }

        private void SetSlug(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug)) throw new DomainException("Slug inválido.");
            Slug = slug.Trim();
        }

        private void UpdateModifiedAt() => ModifiedAt = DateTime.UtcNow;
    }
}