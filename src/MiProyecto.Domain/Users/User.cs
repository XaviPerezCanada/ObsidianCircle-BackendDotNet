
using MiProyecto.Domain.BoardGames.Exceptions;
using MiProyecto.Domain.Common.ValueObjects;


namespace MiProyecto.Domain.Users
{
    public class User
    {
   
        public string Username { get; set; } = default!;
        public Slug Slug { get; private set; } = default!;

        public string Email { get; set; } = default!;

        public string Password { get; set; } = default!;

        public string Bio { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public DateTime CreatedAt { get; private set; }
        public DateTime? ModifiedAt { get; private set; }
        public Status Status { get; private set; }

        public UserType Type { get; private set; }

        public bool IsAvailable => Status.IsActive;

        protected User()
        {

            Status = Status.Active;
        }

        public User(
             string username,
             string slug,
             string email,
             string password,
             string bio,
             string image,
             DateTime createdAt,
             DateTime? modifiedAt,
             Status status,
             UserType type)
                    {
                    Username = username;
                    SetSlug(slug);
                    Email = email;
                    Password = password;
                    Bio = bio;
                    Image = image;
                    CreatedAt = createdAt;
                    ModifiedAt = modifiedAt;
                    Status = Status.Active; 
                    Type = type;
                }


        public void Deactivate()
        {
            if (Status.IsInactive) return;

            Status = Status.Inactive;
            UpdateModifiedAt();
        }

        public void Activate()
        {
            // Usamos la propiedad de tu Value Object para chequear
            if (Status.IsActive) return;

            Status = Status.Active;
            UpdateModifiedAt();
        }

        private void SetSlug(string slug)
        {
            Slug = Slug.From(slug); // la validación vive en el VO
        }

        private void UpdateModifiedAt() => ModifiedAt = DateTime.UtcNow;
    }

}
