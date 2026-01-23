using System;
using System.Collections.Generic;
using System.Text;

namespace MiProyecto.Application.GameRooms.DTOs
{
    public record UpdateGameRoomDto(string Name, int Capacity, string Description);
}
