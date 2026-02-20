using AutoMapper;
using MiProyecto.Application.Users.DTOs;
using MiProyecto.Application.Users.Exceptions;
using MiProyecto.Domain.Common.Exceptions;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.Security;
using MiProyecto.Domain.Users;
using MiProyecto.Domain.Users.Interfaces;

namespace MiProyecto.Application.Users.Services;

public class UserHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IRefreshTokenService refreshTokenService,
    IMapper mapper) : IAuthHandler
{
    public async Task<AuthResponseDto> CreateAsync(NewUserDto input, string deviceId, CancellationToken ct)
    {
        await EnsureEmailIsUnique(input.Email, ct);

        var user = mapper.Map<User>(input);

    
        var salt = passwordHasher.GenerateSalt();
        var hash = await passwordHasher.HashAsync(input.Password, salt);

   
        user.SetPassword(hash, salt);

        await userRepository.AddAsync(user, ct);

        return await CreateAuthResponse(user, deviceId, ct);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginUserDto input, string deviceId, CancellationToken ct)
    {
        
        var user = await userRepository.GetByEmailAsync(input.Email, ct);
        VerifyUserStatus(user);

        
        if (!await IsPasswordValid(input.Password, user!))
            throw new InvalidCredentialsException();

        
        return await CreateAuthResponse(user!, deviceId, ct);
    }

    // --- MÉTODOS PRIVADOS DE APOYO (LIMPIEZA) ---

    private async Task EnsureEmailIsUnique(string email, CancellationToken ct)
    {
        var existingUser = await userRepository.GetByEmailAsync(email, ct);
        if (existingUser != null)
            throw new ConflictException($"El email '{email}' ya está registrado.");
    }

    private void VerifyUserStatus(User? user)
    {
        if (user == null) throw new InvalidCredentialsException();
        if (!user.IsAvailable) throw new BusinessException("Esta cuenta está desactivada.");
    }

    private async Task<bool> IsPasswordValid(string password, User user)
    {
        var loginHash = await passwordHasher.HashAsync(password, user.Salt);
        return Enumerable.SequenceEqual(loginHash, user.PasswordHash);
    }

    private async Task<AuthResponseDto> CreateAuthResponse(User user, string deviceId, CancellationToken ct)
    {
        var (accessToken, refreshToken) = await refreshTokenService.GenerateTokenPairAsync(user, deviceId, ct);
        return new AuthResponseDto(mapper.Map<UserDto>(user), accessToken, refreshToken);
    }
}