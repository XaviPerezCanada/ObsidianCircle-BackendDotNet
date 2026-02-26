using FluentValidation;
using MiProyecto.Application.Users.DTOs;

namespace MiProyecto.Application.Users.Validation;

public class NewUserDtoValidator : AbstractValidator<NewUserDto>
{
    public NewUserDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .WithMessage("El nombre de usuario es obligatorio")
            .MinimumLength(3)
            .WithMessage("El nombre de usuario debe tener al menos 3 caracteres");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("El email es obligatorio")
            .EmailAddress()
            .WithMessage("El email no es válido");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("La contraseña es obligatoria")
            .MinimumLength(6)
            .WithMessage("La contraseña debe tener al menos 6 caracteres");
    }
}

public class LoginUserDtoValidator : AbstractValidator<LoginUserDto>
{
    public LoginUserDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("El email es obligatorio")
            .EmailAddress()
            .WithMessage("El email no es valido");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("La contrasenya es obligatoria");
    }
}

public class RefreshTokenDtoValidator : AbstractValidator<RefreshTokenDto>
{
    public RefreshTokenDtoValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty()
            .WithMessage("El refresh token es obligatorio");

        RuleFor(x => x.DeviceId)
            .NotEmpty()
            .WithMessage("El device ID es obligatorio");
    }
}
