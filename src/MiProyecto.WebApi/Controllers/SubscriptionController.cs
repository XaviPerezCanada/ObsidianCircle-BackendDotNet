using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiProyecto.Application.Subscriptions.Interfaces;
using MiProyecto.Domain.Common.ValueObjects;
using MiProyecto.Domain.Subscriptions;
using MiProyecto.Domain.Users.Interfaces;
using System.Security.Claims;
using Stripe;
using Stripe.Checkout;

namespace MiProyecto.WebApi.Controllers;

[ApiController]
[Route("api/subscriptions")]
[Authorize]
public class SubscriptionController : ControllerBase
{
    private readonly IPlanRepository _plans;
    private readonly IUserRepository _users;
    private readonly IConfiguration _configuration;

    public SubscriptionController(IPlanRepository plans, IUserRepository users, IConfiguration configuration)
    {
        _plans = plans;
        _users = users;
        _configuration = configuration;
    }

    public record CreateCheckoutSessionRequest(string PlanSlug);
    public record CreateCheckoutSessionResponse(string SessionId, string Url);
    public record ConfirmPaymentResponse(bool Success, string Message);

    [HttpPost("create-checkout-session")]
    public async Task<ActionResult<CreateCheckoutSessionResponse>> CreateCheckoutSession(
        [FromBody] CreateCheckoutSessionRequest req,
        CancellationToken ct)
    {
        var plan = await _plans.GetBySlugAsync(req.PlanSlug, ct);
        if (plan is null || !plan.Activo)
            return BadRequest(new { message = "Plan no válido" });

        var stripeSection = _configuration.GetSection("Stripe");
        var secretKey = Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY")
                        ?? stripeSection["SecretKey"];
        var successUrl = stripeSection["SuccessUrl"];
        var cancelUrl = stripeSection["CancelUrl"];

        if (string.IsNullOrWhiteSpace(secretKey) ||
            string.IsNullOrWhiteSpace(successUrl) ||
            string.IsNullOrWhiteSpace(cancelUrl))
        {
            return StatusCode(500, new { message = "Falta configuración de Stripe en appsettings.json." });
        }

        StripeConfiguration.ApiKey = secretKey;

        var options = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "eur",
                        UnitAmount = plan.PrecioCent,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = plan.Nombre,
                        },
                    },
                    Quantity = 1,
                }
            },
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: ct);

        return Ok(new CreateCheckoutSessionResponse(session.Id, session.Url));
    }

    [HttpPost("confirm-payment")]
    public async Task<ActionResult<ConfirmPaymentResponse>> ConfirmPayment(CancellationToken ct)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrWhiteSpace(email))
            return Unauthorized(new ConfirmPaymentResponse(false, "Usuario no autenticado"));

        var user = await _users.GetByEmailAsync(email, ct);
        if (user is null)
            return Unauthorized(new ConfirmPaymentResponse(false, "Usuario no encontrado"));

        // Marcar usuario como SOCIO
        user.SetType(UserType.Socio);
        await _users.UpdateAsync(user, ct);

        return Ok(new ConfirmPaymentResponse(true, "Suscripción activada"));
    }
}

