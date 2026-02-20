using AutoMapper;
using MiProyecto.Application.Users.DTOs;
using MiProyecto.Domain.Users;

namespace MiProyecto.Application.Users.Mapping;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
      
        CreateMap<User, UserDto>()
            .ForMember(d => d.Slug, o => o.MapFrom(s => s.Slug.Value))
            .ForMember(d => d.Type, o => o.MapFrom(s => s.Type.Value));

        
        CreateMap<NewUserDto, User>()
            .ConstructUsing(src => User.CreateBasic(
                src.Username,
                src.Email,
                Array.Empty<byte>(),
                Array.Empty<byte>()))
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.Salt, opt => opt.Ignore());
    }
}
