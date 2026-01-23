using System;
using System.Collections.Generic;
using System.Text;

namespace MiProyecto.Application.GameRooms.DTOs
{
    public record GameRoomDto(Guid Id, string Name,string Slug, int Capacity, string Status, string Description);
}
