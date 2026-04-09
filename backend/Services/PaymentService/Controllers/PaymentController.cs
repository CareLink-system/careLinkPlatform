using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PaymentService.DTOs;
using PaymentService.Services;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using System.ComponentModel.DataAnnotations;
using PaymentService.Extensions;

namespace PaymentService.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[Route("api/v1/payments")]
[ApiExplorerSettings(GroupName = "v1")]
[Produces("application/json")]
[Consumes("application/json")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentController> _logger;
    private readonly IMemoryCache _cache;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PaymentController(
        IPaymentService paymentService,
        ILogger<PaymentController> logger,
        IMemoryCache cache,
        IHttpContextAccessor httpContextAccessor)
    {
        _paymentService = paymentService;
        _logger = logger;
        _cache = cache;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetRequestId()
    {
        return _httpContextAccessor.HttpContext?.Request.Headers["X-Request-ID"].FirstOrDefault() 
               ?? Guid.NewGuid().ToString();
    }

    /// <summary>
    /// Get all payments with pagination and filtering.
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Items per page (default: 10, max: 50)</param>
    /// <param name="status">Filter by payment status</param>
    /// <param name="fromDate">Filter from date</param>
    /// <param name="toDate">Filter to date</param>
    /// <response code="200">Returns paginated payments.</response>
    /// <response code="400">Invalid parameters.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<PaymentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PaginatedResponse<PaymentResponseDto>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var requestId = GetRequestId();
        var userId = User.GetUserId();
        var userRole = User.GetUserRole();

        try
        {
            // Validate pagination
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            _logger.LogInformation(
                "[{RequestId}] User {UserId} ({Role}) requesting payments - Page: {Page}, Size: {PageSize}, Status: {Status}",
                requestId, userId, userRole, page, pageSize, status ?? "all");

            // Build cache key
            var cacheKey = $"payments_{userId}_{page}_{pageSize}_{status}_{fromDate?.ToString("yyyyMMdd")}_{toDate?.ToString("yyyyMMdd")}";
            
            var result = await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2);
                entry.SlidingExpiration = TimeSpan.FromMinutes(1);
                
                return await _paymentService.GetPaginatedAsync(page, pageSize, status, fromDate, toDate, userId, userRole);
            });

            _logger.LogInformation(
                "[{RequestId}] Retrieved {Count} payments for user {UserId}. Total: {TotalCount}",
                requestId, result.Items.Count(), userId, result.TotalCount);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "[{RequestId}] Invalid parameters: {Message}", requestId, ex.Message);
            return BadRequest(new ApiErrorResponse
            {
                Status = 400,
                Title = "Invalid Parameters",
                Detail = ex.Message,
                RequestId = requestId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Error retrieving payments for user {UserId}", requestId, userId);
            return StatusCode(500, new ApiErrorResponse
            {
                Status = 500,
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving payments.",
                RequestId = requestId
            });
        }
    }

    /// <summary>
    /// Get payment details by Id.
    /// </summary>
    /// <param name="id">Payment Id</param>
    /// <response code="200">Returns payment details.</response>
    /// <response code="400">Invalid payment Id.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - insufficient permissions.</response>
    /// <response code="404">Payment not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PaymentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PaymentResponseDto>> GetById([Required] int id)
    {
        var requestId = GetRequestId();
        var userId = User.GetUserId();
        var userRole = User.GetUserRole();

        if (id <= 0)
        {
            _logger.LogWarning("[{RequestId}] Invalid payment Id: {PaymentId}", requestId, id);
            return BadRequest(new ApiErrorResponse
            {
                Status = 400,
                Title = "Invalid Payment ID",
                Detail = "Payment ID must be a positive integer.",
                RequestId = requestId
            });
        }

        try
        {
            var result = await _paymentService.GetByIdAsync(id);
            
            if (result == null)
            {
                _logger.LogWarning("[{RequestId}] Payment not found. Id: {PaymentId}", requestId, id);
                return NotFound(new ApiErrorResponse
                {
                    Status = 404,
                    Title = "Payment Not Found",
                    Detail = $"No payment found with ID {id}.",
                    RequestId = requestId
                });
            }

            // Check authorization
            if (userRole != "Admin" && result.PatientId != userId)
            {
                _logger.LogWarning("[{RequestId}] User {UserId} attempted to access payment {PaymentId} of another user", requestId, userId, id);
                return Forbid();
            }

            _logger.LogInformation("[{RequestId}] Retrieved payment successfully. Id: {PaymentId}", requestId, id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Error retrieving payment. Id: {PaymentId}", requestId, id);
            return StatusCode(500, new ApiErrorResponse
            {
                Status = 500,
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving the payment.",
                RequestId = requestId
            });
        }
    }

    /// <summary>
    /// Create a new payment.
    /// </summary>
    /// <param name="request">Payment data to create</param>
    /// <response code="201">Payment created successfully.</response>
    /// <response code="400">Invalid payment data.</response>
    /// <response code="401">User not authenticated.</response>
    /// <response code="403">Forbidden - can only create payments for yourself.</response>
    /// <response code="409">Conflict - duplicate or invalid state.</response>
    /// <response code="422">Unprocessable entity - validation failed.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost]
    [ProducesResponseType(typeof(PaymentResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PaymentResponseDto>> Create([FromBody] PaymentRequestDto request)
    {
        var requestId = GetRequestId();
        var userId = User.GetUserId();
        var userRole = User.GetUserRole();

        // Validate request
        if (request == null)
        {
            _logger.LogWarning("[{RequestId}] Null payment request received", requestId);
            return BadRequest(new ApiErrorResponse
            {
                Status = 400,
                Title = "Invalid Request",
                Detail = "Payment request cannot be null.",
                RequestId = requestId
            });
        }

        // Validate required fields
        var validationErrors = new List<ValidationError>();
        
        if (string.IsNullOrWhiteSpace(request.PatientId))
            validationErrors.Add(new ValidationError { Field = "PatientId", Message = "Patient ID is required." });
        
        if (string.IsNullOrWhiteSpace(request.DoctorId))
            validationErrors.Add(new ValidationError { Field = "DoctorId", Message = "Doctor ID is required." });
        
        if (request.Amount <= 0)
            validationErrors.Add(new ValidationError { Field = "Amount", Message = "Amount must be greater than 0." });
        
        if (string.IsNullOrWhiteSpace(request.Currency))
            validationErrors.Add(new ValidationError { Field = "Currency", Message = "Currency is required." });
        
        if (validationErrors.Any())
        {
            _logger.LogWarning("[{RequestId}] Validation failed for payment creation", requestId);
            return UnprocessableEntity(new ValidationErrorResponse
            {
                Status = 422,
                Title = "Validation Failed",
                Errors = validationErrors,
                RequestId = requestId
            });
        }

        // Check authorization
        if (userRole != "Admin" && request.PatientId != userId)
        {
            _logger.LogWarning("[{RequestId}] User {UserId} attempted to create payment for another patient {PatientId}", 
                requestId, userId, request.PatientId);
            return Forbid();
        }

        try
        {
            var result = await _paymentService.CreateAsync(request);
            
            // Clear cache for this user
            _cache.Remove($"payments_{userId}_*");
            
            _logger.LogInformation(
                "[{RequestId}] Payment created successfully. Id: {PaymentId}, Amount: {Amount} {Currency}, Patient: {PatientId}",
                requestId, result.Id, result.Amount, result.Currency, result.PatientId);
            
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "[{RequestId}] Invalid argument: {Message}", requestId, ex.Message);
            return BadRequest(new ApiErrorResponse
            {
                Status = 400,
                Title = "Invalid Data",
                Detail = ex.Message,
                RequestId = requestId
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "[{RequestId}] Invalid operation: {Message}", requestId, ex.Message);
            return Conflict(new ApiErrorResponse
            {
                Status = 409,
                Title = "Conflict",
                Detail = ex.Message,
                RequestId = requestId
            });
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("duplicate") == true)
        {
            _logger.LogError(ex, "[{RequestId}] Duplicate payment detected", requestId);
            return Conflict(new ApiErrorResponse
            {
                Status = 409,
                Title = "Duplicate Payment",
                Detail = "A payment with these details already exists.",
                RequestId = requestId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Error creating payment for user {UserId}", requestId, userId);
            return StatusCode(500, new ApiErrorResponse
            {
                Status = 500,
                Title = "Internal Server Error",
                Detail = "An error occurred while creating the payment.",
                RequestId = requestId
            });
        }
    }

    /// <summary>
    /// Update payment details by Id.
    /// </summary>
    /// <param name="id">Payment Id</param>
    /// <param name="request">Payment data to update</param>
    /// <response code="200">Payment updated successfully.</response>
    /// <response code="400">Invalid payment data.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - insufficient permissions.</response>
    /// <response code="404">Payment not found.</response>
    /// <response code="409">Conflict - cannot update due to state.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(PaymentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PaymentResponseDto>> Update(
        [Required] int id, 
        [FromBody] PaymentRequestDto request)
    {
        var requestId = GetRequestId();
        var userId = User.GetUserId();

        if (id <= 0)
        {
            return BadRequest(new ApiErrorResponse
            {
                Status = 400,
                Title = "Invalid Payment ID",
                Detail = "Payment ID must be a positive integer.",
                RequestId = requestId
            });
        }

        if (request == null)
        {
            return BadRequest(new ApiErrorResponse
            {
                Status = 400,
                Title = "Invalid Request",
                Detail = "Payment request cannot be null.",
                RequestId = requestId
            });
        }

        try
        {
            var result = await _paymentService.UpdateAsync(id, request);
            
            // Clear cache
            _cache.Remove($"payments_{userId}_*");
            
            _logger.LogInformation("[{RequestId}] Payment updated successfully. Id: {PaymentId}", requestId, id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            _logger.LogWarning("[{RequestId}] Payment not found for update. Id: {PaymentId}", requestId, id);
            return NotFound(new ApiErrorResponse
            {
                Status = 404,
                Title = "Payment Not Found",
                Detail = $"No payment found with ID {id}.",
                RequestId = requestId
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "[{RequestId}] Cannot update payment: {Message}", requestId, ex.Message);
            return Conflict(new ApiErrorResponse
            {
                Status = 409,
                Title = "Cannot Update",
                Detail = ex.Message,
                RequestId = requestId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Error updating payment. Id: {PaymentId}", requestId, id);
            return StatusCode(500, new ApiErrorResponse
            {
                Status = 500,
                Title = "Internal Server Error",
                Detail = "An error occurred while updating the payment.",
                RequestId = requestId
            });
        }
    }

    /// <summary>
    /// Delete payment by Id (soft delete).
    /// </summary>
    /// <param name="id">Payment Id</param>
    /// <response code="204">Payment deleted successfully.</response>
    /// <response code="400">Invalid payment Id.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="403">Forbidden - insufficient permissions.</response>
    /// <response code="404">Payment not found.</response>
    /// <response code="409">Conflict - cannot delete due to dependencies.</response>
    /// <response code="500">Internal server error.</response>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete([Required] int id)
    {
        var requestId = GetRequestId();
        var userId = User.GetUserId();

        if (id <= 0)
        {
            return BadRequest(new ApiErrorResponse
            {
                Status = 400,
                Title = "Invalid Payment ID",
                Detail = "Payment ID must be a positive integer.",
                RequestId = requestId
            });
        }

        try
        {
            var success = await _paymentService.DeleteAsync(id);
            
            if (!success)
            {
                _logger.LogWarning("[{RequestId}] Payment not found for deletion. Id: {PaymentId}", requestId, id);
                return NotFound(new ApiErrorResponse
                {
                    Status = 404,
                    Title = "Payment Not Found",
                    Detail = $"No payment found with ID {id}.",
                    RequestId = requestId
                });
            }
            
            // Clear cache
            _cache.Remove($"payments_{userId}_*");
            
            _logger.LogInformation("[{RequestId}] Payment deleted successfully. Id: {PaymentId}", requestId, id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "[{RequestId}] Cannot delete payment due to dependencies. Id: {PaymentId}", requestId, id);
            return Conflict(new ApiErrorResponse
            {
                Status = 409,
                Title = "Cannot Delete",
                Detail = ex.Message,
                RequestId = requestId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Error deleting payment. Id: {PaymentId}", requestId, id);
            return StatusCode(500, new ApiErrorResponse
            {
                Status = 500,
                Title = "Internal Server Error",
                Detail = "An error occurred while deleting the payment.",
                RequestId = requestId
            });
        }
    }

    /// <summary>
    /// Get payment summary statistics.
    /// </summary>
    /// <response code="200">Returns payment statistics.</response>
    /// <response code="401">Unauthorized.</response>
    // [HttpGet("summary")]
    // [ProducesResponseType(typeof(PaymentSummaryDto), StatusCodes.Status200OK)]
    // [ProducesResponseType(StatusCodes.Status401Unauthorized)]

    public async Task<ActionResult<PaymentSummaryDto>> GetSummary()
    {
        var requestId = GetRequestId();
        var userId = User.GetUserId();
        var userRole = User.GetUserRole();

        try
        {
            var cacheKey = $"payment_summary_{userId}_{userRole}";
            
            var summary = await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
                return await _paymentService.GetSummaryAsync(userId, userRole);
            });

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Error retrieving payment summary for user {UserId}", requestId, userId);
            return StatusCode(500, new ApiErrorResponse
            {
                Status = 500,
                Title = "Internal Server Error",
                Detail = "An error occurred while retrieving payment summary.",
                RequestId = requestId
            });
        }
    }
}
