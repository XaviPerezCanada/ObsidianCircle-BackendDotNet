using System.ComponentModel.DataAnnotations;

namespace MiProyecto.WebApi.Models
{


    public record UserEnvelope<T>([Required] T User);



}
