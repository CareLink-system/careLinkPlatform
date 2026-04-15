using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using PaymentService.DTOs;
using PaymentService.Enum;
using PaymentService.Extensions;
using PaymentService.Services;
using Stripe;
using Stripe.Checkout;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text.Json;

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
    private readonly IWebHostEnvironment _environment; 

    public PaymentController(
        IPaymentService paymentService,
        ILogger<PaymentController> logger,
        IMemoryCache cache,
        IHttpContextAccessor httpContextAccessor,
        IWebHostEnvironment environment)
    {
        _paymentService = paymentService;
        _logger = logger;
        _cache = cache;
        _httpContextAccessor = httpContextAccessor;
        _environment = environment;
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


    //[HttpPost("create-session")]
    //public async Task<IActionResult> CreateSession([FromBody] CreateCheckoutSessionRequest request)
    //{
    //    var options = new SessionCreateOptions
    //    {
    //        //Mode = "payment",
    //        //SuccessUrl = "http://localhost:5173/success",
    //        //CancelUrl = "http://localhost:5173/cancel",
    //        LineItems = new List<SessionLineItemOptions>
    //        {
    //            new SessionLineItemOptions
    //            {
    //                //Quantity = 1,
    //                PriceData = new SessionLineItemPriceDataOptions
    //                {
    //                    Currency = request.Currency,
    //                    UnitAmount = request.Amount, // $50
    //                    ProductData = new SessionLineItemPriceDataProductDataOptions
    //                    {
    //                        Name = "Test Payment"
    //                    }
    //                }
    //            }
    //        }
    //    };

    //    var service = new SessionService();
    //    var session = await service.CreateAsync(options);

    //    return Ok(new { url = session.Url });
    //}

    /// <summary>
    /// Create a Stripe Checkout Session for payment processing.
    /// </summary>
    /// <param name="request">Checkout session request details</param>
    /// <response code="200">Returns Stripe checkout session URL.</response>
    /// <response code="400">Invalid request data.</response>
    /// <response code="401">Unauthorized.</response>
    /// <response code="409">Payment already exists or conflict.</response>
    /// <response code="422">Validation failed.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("create-session")]
    [ProducesResponseType(typeof(CheckoutSessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateSession([FromBody] CreateCheckoutSessionRequest request)
    {
        var requestId = GetRequestId();
        var userId = User.GetUserId();
        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
        var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Customer";

        // Validate request
        if (request == null)
        {
            _logger.LogWarning("[{RequestId}] Null checkout session request received", requestId);
            return BadRequest(new ApiErrorResponse
            {
                Status = 400,
                Title = "Invalid Request",
                Detail = "Checkout session request cannot be null.",
                RequestId = requestId
            });
        }

        // Validate required fields
        var validationErrors = new List<ValidationError>();

        if (request.Amount <= 0)
            validationErrors.Add(new ValidationError { Field = "Amount", Message = "Amount must be greater than 0." });

        if (string.IsNullOrWhiteSpace(request.Currency))
            validationErrors.Add(new ValidationError { Field = "Currency", Message = "Currency is required." });

        if (string.IsNullOrWhiteSpace(request.DoctorId))
            validationErrors.Add(new ValidationError { Field = "DoctorId", Message = "Doctor ID is required." });

        if (string.IsNullOrWhiteSpace(request.PatientId))
            validationErrors.Add(new ValidationError { Field = "PatientId", Message = "Patient ID is required." });

        if (string.IsNullOrWhiteSpace(request.SuccessUrl))
            validationErrors.Add(new ValidationError { Field = "SuccessUrl", Message = "Success URL is required." });

        if (string.IsNullOrWhiteSpace(request.CancelUrl))
            validationErrors.Add(new ValidationError { Field = "CancelUrl", Message = "Cancel URL is required." });

        // Validate URLs
        if (!string.IsNullOrWhiteSpace(request.SuccessUrl) && !Uri.IsWellFormedUriString(request.SuccessUrl, UriKind.Absolute))
            validationErrors.Add(new ValidationError { Field = "SuccessUrl", Message = "Success URL must be a valid absolute URL." });

        if (!string.IsNullOrWhiteSpace(request.CancelUrl) && !Uri.IsWellFormedUriString(request.CancelUrl, UriKind.Absolute))
            validationErrors.Add(new ValidationError { Field = "CancelUrl", Message = "Cancel URL must be a valid absolute URL." });

        // ✅ Validate currency format - Only USD and LKR
        var validCurrencies = new[] { "usd", "lkr" };
        var currencyLower = request.Currency.ToLower();

        if (!validCurrencies.Contains(currencyLower))
        {
            validationErrors.Add(new ValidationError
            {
                Field = "Currency",
                Message = $"Currency must be one of: {string.Join(", ", validCurrencies)}. Current value: {request.Currency}"
            });
        }
        else
        {
            //// Validate amount based on currency (minimum amounts)
            //var minAmounts = new Dictionary<string, long>
            //{
            //    { "usd", 50 },     // $0.50 minimum for USD
            //    { "lkr", 10000 }    // 100.00 LKR minimum
            //};

            //var maxAmounts = new Dictionary<string, long>
            //{
            //    { "usd", 99999900 },    // $999,999.00 maximum
            //    { "lkr", 9999990000 }    // 99,999,900.00 LKR maximum
            //};

            //if (minAmounts.ContainsKey(currencyLower) && request.Amount < minAmounts[currencyLower])
            //{
            //    validationErrors.Add(new ValidationError
            //    {
            //        Field = "Amount",
            //        Message = $"Minimum amount for {request.Currency.ToUpper()} is {(currencyLower == "usd" ? "$" : "Rs.")}{minAmounts[currencyLower] / 100.0:F2}"
            //    });
            //}

            //if (maxAmounts.ContainsKey(currencyLower) && request.Amount > maxAmounts[currencyLower])
            //{
            //    validationErrors.Add(new ValidationError
            //    {
            //        Field = "Amount",
            //        Message = $"Maximum amount for {request.Currency.ToUpper()} is {(currencyLower == "usd" ? "$" : "Rs.")}{maxAmounts[currencyLower] / 100.0:F2}"
            //    });
            //}
        }

        // Check if user is authorized to create payment for this patient
        var userRole = User.GetUserRole();
        if (userRole != "Admin" && request.PatientId != userId)
        {
            _logger.LogWarning("[{RequestId}] User {UserId} attempted to create payment for another patient {PatientId}",
                requestId, userId, request.PatientId);
            return Forbid();
        }

        if (validationErrors.Any())
        {
            _logger.LogWarning("[{RequestId}] Validation failed for checkout session creation. Errors: {Errors}",
                requestId, string.Join(", ", validationErrors.Select(e => $"{e.Field}: {e.Message}")));
            return UnprocessableEntity(new ValidationErrorResponse
            {
                Status = 422,
                Title = "Validation Failed",
                Errors = validationErrors,
                RequestId = requestId
            });
        }

        try
        {
            // Check if payment already exists for this consultation
            if (request.ConsultationId.HasValue)
            {
                var existingPayment = await _paymentService.GetByConsultationIdAsync(request.ConsultationId);
                if (existingPayment != null && existingPayment.PaymentStatus == CommonStatus.PaymentCompleted)
                {
                    _logger.LogWarning("[{RequestId}] Payment already completed for consultation {ConsultationId}",
                        requestId, request.ConsultationId);
                    return Conflict(new ApiErrorResponse
                    {
                        Status = 409,
                        Title = "Payment Already Processed",
                        Detail = "This consultation has already been paid for.",
                        RequestId = requestId
                    });
                }
            }

            // Generate unique session ID for idempotency
            var idempotencyKey = $"session_{request.ConsultationId ?? 0}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

            // Create product name and description based on currency
            var amountDisplay = currencyLower == "usd"
                ? $"${request.Amount / 100.0:F2} USD"
                : $"Rs.{request.Amount / 100.0:F2} LKR";

            var productName = string.IsNullOrWhiteSpace(request.ProductName)
                ? $"Consultation with Dr. {request.DoctorName ?? request.DoctorId}"
                : request.ProductName;

            var productDescription = string.IsNullOrWhiteSpace(request.ProductDescription)
                ? $"Payment for consultation - Amount: {amountDisplay}"
                : request.ProductDescription;

            // Create metadata for tracking
            var metadata = new Dictionary<string, string>
            {
                { "user_id", userId },
                { "patient_id", request.PatientId },
                { "doctor_id", request.DoctorId },
                { "consultation_id", request.ConsultationId?.ToString() ?? "" },
                { "environment", _environment.EnvironmentName },
                { "created_at", DateTime.UtcNow.ToString("o") },
                { "currency", currencyLower }
            };

            // Add payment type to metadata if provided
            //if (!string.IsNullOrWhiteSpace(request.PaymentType))
            //{
            //    metadata.Add("payment_type", request.PaymentType);
            //}

            // Build success and cancel URLs with query parameters
            var successUrl = request.SuccessUrl.Contains('?')
                ? $"{request.SuccessUrl}&session_id={{CHECKOUT_SESSION_ID}}&payment_id={{PAYMENT_INTENT_ID}}"
                : $"{request.SuccessUrl}?session_id={{CHECKOUT_SESSION_ID}}&payment_id={{PAYMENT_INTENT_ID}}";

            var cancelUrl = request.CancelUrl.Contains('?')
                ? $"{request.CancelUrl}&session_id={{CHECKOUT_SESSION_ID}}"
                : $"{request.CancelUrl}?session_id={{CHECKOUT_SESSION_ID}}";

            // Configure payment method types based on currency
            var paymentMethodTypes = new List<string> { "card" };

            // Add additional payment methods for USD
            //if (currencyLower == "usd")
            //{
            //    paymentMethodTypes.AddRange(new[] { "link", "cashapp", "us_bank_account" });
            //}

            // Add additional payment methods for LKR (Stripe supports card only for LKR)
            // Note: For LKR, only card payments are supported by Stripe

            // Configure the Stripe session
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = paymentMethodTypes,
                LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = currencyLower,
                        UnitAmount = request.Amount,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = productName,
                            Description = productDescription,
                            Metadata = metadata,
                            Images = request.ProductImages ?? new List<string>()
                        },
                    },
                    Quantity = 1,
                    //AdjustableQuantity = new SessionLineItemAdjustableQuantityOptions
                    //{
                    //    Enabled = false,
                    //    Maximum = 1,
                    //    Minimum = 1
                    //}
                }
            },
                Mode = "payment",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                Metadata = metadata,
                CustomerEmail = userEmail ?? request.CustomerEmail,
                CustomerCreation = string.IsNullOrEmpty(userEmail) ? "always" : null,
                ClientReferenceId = request.ConsultationId?.ToString() ?? Guid.NewGuid().ToString(),
                ExpiresAt = DateTime.UtcNow.AddMinutes(30),
                PaymentIntentData = new SessionPaymentIntentDataOptions
                {
                    Metadata = metadata,
                    Description = productDescription,
                    SetupFutureUsage = "off_session",
                },
                Locale = request.Locale ?? (currencyLower == "lkr" ? "en" : "auto"),
                PaymentMethodOptions = new SessionPaymentMethodOptionsOptions
                {
                    Card = new SessionPaymentMethodOptionsCardOptions
                    {
                        RequestThreeDSecure = "automatic"
                    }
                }
            };

            // Add billing address collection only for USD
            if (currencyLower == "usd")
            {
                options.BillingAddressCollection = "required";
                options.ShippingAddressCollection = new SessionShippingAddressCollectionOptions
                {
                    AllowedCountries = new List<string> { "US", "CA", "GB", "AU", "DE", "FR", "ES", "IT", "NL" }
                };
                options.PhoneNumberCollection = new SessionPhoneNumberCollectionOptions
                {
                    Enabled = true,
                };
            }

            // Create the Stripe session with idempotency
            var service = new SessionService();
            var requestOptions = new RequestOptions
            {
                IdempotencyKey = idempotencyKey
            };
            var session = await service.CreateAsync(options, requestOptions);


            // Store session information in database for webhook handling
            var paymentRequest = new PaymentRequestDto
            {
                AppointmentId = request.AppointmentId,
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                Amount = request.Amount,
                Currency = currencyLower.ToUpper(),
                PaymentMethod = "card",
                PaymentStatus = CommonStatus.PaymentPending,
                TransactionId = session.Id,
                PaymentGateway = "Stripe",
                Notes = $"Checkout session created at {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC",
                ConsultationId = request.ConsultationId,
                StripeSessionId = session.Id,
                StripePaymentIntentId = session.PaymentIntentId,
                Metadata = JsonSerializer.Serialize(metadata)
            };

            // Create pending payment record
            var paymentRecord = await _paymentService.CreatePendingAsync(paymentRequest);

            _logger.LogInformation(
                "[{RequestId}] Stripe checkout session created successfully. SessionId: {SessionId}, PaymentId: {PaymentId}, Amount: {Amount} {Currency}, Consultation: {ConsultationId}",
                requestId, session.Id, paymentRecord?.Id, request.Amount / 100.0, currencyLower.ToUpper(), request.ConsultationId);

            var expiresAt = session.ExpiresAt;

            // Return session URL and session ID to client
            return Ok(new CheckoutSessionResponse
            {
                SessionId = session.Id,
                Url = session.Url,
                PaymentId = paymentRecord?.Id,
                ExpiresAt = expiresAt,
                Amount = request.Amount,
                Currency = currencyLower.ToUpper(),
                ConsultationId = request.ConsultationId
            });
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "[{RequestId}] Stripe error creating checkout session: {StripeErrorType} - {StripeErrorMessage}",
                requestId, ex.StripeError?.Type, ex.StripeError?.Message ?? ex.Message);

            var errorDetail = ex.StripeError?.Message switch
            {
                var msg when msg?.Contains("currency") == true => "Invalid currency or amount for the selected currency.",
                var msg when msg?.Contains("minimum") == true => "Amount is below the minimum allowed for this currency.",
                var msg when msg?.Contains("maximum") == true => "Amount exceeds the maximum allowed for this currency.",
                _ => ex.StripeError?.Message ?? "An error occurred with the payment provider."
            };

            return StatusCode(500, new ApiErrorResponse
            {
                Status = 500,
                Title = "Payment Provider Error",
                Detail = errorDetail,
                RequestId = requestId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[{RequestId}] Error creating checkout session for user {UserId}", requestId, userId);
            return StatusCode(500, new ApiErrorResponse
            {
                Status = 500,
                Title = "Internal Server Error",
                Detail = "An error occurred while creating the checkout session. Please try again later.",
                RequestId = requestId
            });
        }
    }
}
