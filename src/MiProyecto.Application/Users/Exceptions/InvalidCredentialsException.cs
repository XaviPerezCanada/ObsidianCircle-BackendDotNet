using System;
using System.Collections.Generic;
using System.Text;

namespace MiProyecto.Application.Users.Exceptions
{
    public class InvalidCredentialsException : Exception
    {
        public InvalidCredentialsException() : base("Correo electrónico o contraseña incorrectos.") { }
    }
    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message) { }
    }
}
