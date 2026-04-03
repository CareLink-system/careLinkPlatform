using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaymentService.DTOs;
using PaymentService.Services;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/v1/payments")]
//[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _paymentService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _paymentService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PaymentRequestDto request)
    {
        // Get current user ID from JWT token
        var userId = User.FindFirst("sub")?.Value ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User not authenticated");
        }

        // Optional: Validate that the payment is for the authenticated user
        if (request.PatientId != userId)
        {
            return Forbid("You can only create payments for yourself");
        }

        var result = await _paymentService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] PaymentRequestDto request)
    {
        var result = await _paymentService.UpdateAsync(id, request);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _paymentService.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
