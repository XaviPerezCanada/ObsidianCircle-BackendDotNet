using MiProyecto.Domain.BoardGames.Enums;
using MiProyecto.Domain.BoardGames.Exceptions;
using MiProyecto.Domain.Common;


namespace MiProyecto.Domain.BoardGames.Entities
{
    public class BoardGame
    {
        public int Id { get; private set; }

        public string Titulo { get; private set; } = string.Empty;
        public string Socio { get; private set; } = string.Empty;

        public string Slug { get; private set; } = string.Empty;

        public string Editorial { get; private set; } = string.Empty;
        public string Genero { get; private set; } = string.Empty;

        public string Descripcion { get; private set; } = string.Empty;

        public int JugadoresMin { get; private set; }
        public int JugadoresMax { get; private set; }

        public int EdadRecomendada { get; private set; }
        public int DuracionMinutos { get; private set; }

        public string Ubicacion { get; private set; } = string.Empty;
        public string Idioma { get; private set; } = "Español";

    

        public string ImagenUrl { get; private set; } = string.Empty;
        public string Observaciones { get; private set; } = string.Empty;

        public PhysicalStatus Estado { get; private set; } = PhysicalStatus.BuenEstado;
        public LoanStatus Disponibilidad { get; private set; } = LoanStatus.Disponible;

        public DateTime FechaRegistro { get; private set; } = DateTime.UtcNow;

        protected BoardGame() { }

        public BoardGame(string titulo, string slug, string socio, int jugadoresMin, int jugadoresMax)
        {
            SetTitulo(titulo);
            SetSlug(slug);             
            SetSocio(socio);
            SetJugadores(jugadoresMin, jugadoresMax);
            FechaRegistro = DateTime.UtcNow;
        }


        public void SetTitulo(string titulo)
        {
            if (string.IsNullOrWhiteSpace(titulo))
                throw new DomainException("El título es obligatorio.");

            Titulo = titulo.Trim();
            
        }

        private void SetSlug(string slug)
        {
            if (string.IsNullOrWhiteSpace(slug))
                throw new DomainException("Slug inválido.");

            Slug = slug.Trim();
        }

        public void SetSocio(string socio)
        {
            if (string.IsNullOrWhiteSpace(socio))
                throw new DomainException("Debes indicar qué socio cede el juego.");

            Socio = socio.Trim();
        }


        public void SetJugadores(int min, int max)
        {
            if (min < 1 || min > 100) throw new DomainException("JugadoresMin debe estar entre 1 y 100.");
            if (max < 1 || max > 100) throw new DomainException("JugadoresMax debe estar entre 1 y 100.");
            if (min > max) throw new DomainException("JugadoresMin no puede ser mayor que JugadoresMax.");

            JugadoresMin = min;
            JugadoresMax = max;
        }

        public void Reservar()
        {
            if (Disponibilidad != LoanStatus.Disponible)
                throw new DomainException("Solo se puede reservar un juego disponible.");

            Disponibilidad = LoanStatus.Reservado;
        }

        public void Prestar()
        {
            if (Disponibilidad != LoanStatus.Disponible &&
                Disponibilidad != LoanStatus.Reservado)
                throw new DomainException("Solo se puede prestar si está disponible o reservado.");

            Disponibilidad = LoanStatus.Prestado;
        }

        public void Devolver()
        {
            if (Disponibilidad != LoanStatus.Prestado)
                throw new DomainException("Solo se puede devolver un juego que está prestado.");

            Disponibilidad = LoanStatus.Disponible;
        }
    }
}
