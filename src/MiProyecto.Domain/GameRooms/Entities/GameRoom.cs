namespace MiProyecto.Domain.GameRooms.Entities

{
    public class GameRoom
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public int Capacity { get; private set; }
        public RoomStatus Status { get; private set; }
        public DateTime CreatedAt { get; private set; }

        public enum RoomStatus
        {
            Active,
            Inactive,
            UnderMaintenance
        }

        // Constructor para garantizar un estado válido al crear
        public GameRoom(string name, int capacity)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("El nombre de la sala no puede estar vacío.", nameof(name));

            if (capacity <= 0)
                throw new ArgumentException("La capacidad debe ser un número positivo.", nameof(capacity));

            Id = Guid.NewGuid();
            Name = name;
            Capacity = capacity;
            Status = RoomStatus.Active;
            CreatedAt = DateTime.UtcNow;
        }

        // Método de dominio (ejemplo opcional): Cambiar estado
        public void SetMaintenanceMode()
        {
            Status = RoomStatus.UnderMaintenance;
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