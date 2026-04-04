using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace ApiGateway.Filters;

/// <summary>
/// Operation filter to add default response codes to all endpoints
/// </summary>
public class AddDefaultResponses : IOperationFilter
{
    /// <summary>
    /// Applies standard HTTP response code documentation to Swagger operations
    /// </summary>
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Add common response codes
        operation.Responses.TryAdd("400", new OpenApiResponse
        {
            Description = "Bad Request - Invalid parameters"
        });
        
        operation.Responses.TryAdd("401", new OpenApiResponse
        {
            Description = "Unauthorized - Missing or invalid JWT token"
        });
        
        operation.Responses.TryAdd("403", new OpenApiResponse
        {
            Description = "Forbidden - Insufficient permissions"
        });
        
        operation.Responses.TryAdd("502", new OpenApiResponse
        {
            Description = "Bad Gateway - Downstream service unavailable"
        });
        
        operation.Responses.TryAdd("503", new OpenApiResponse
        {
            Description = "Service Unavailable - Gateway overloaded"
        });
    }
}
