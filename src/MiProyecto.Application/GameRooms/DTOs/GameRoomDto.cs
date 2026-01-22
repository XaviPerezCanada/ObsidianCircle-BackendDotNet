using System;
using System.Collections.Generic;
using System.Text;

namespace MiProyecto.Application.GameRooms.DTOs
{
    public record GameRoomDto(Guid Id, string Name, int Capacity, string Status);
}
