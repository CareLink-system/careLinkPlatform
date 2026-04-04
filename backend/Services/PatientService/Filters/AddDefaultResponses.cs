using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PatientService.Filters;

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
            Description = "Bad Request - Invalid parameters",
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["application/json"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.Schema,
                            Id = "ProblemDetails"
                        }
                    }
                }
            }
        });
        
        operation.Responses.TryAdd("401", new OpenApiResponse
        {
            Description = "Unauthorized - Missing or invalid JWT token"
        });
        
        operation.Responses.TryAdd("403", new OpenApiResponse
        {
            Description = "Forbidden - Insufficient permissions"
        });
        
        operation.Responses.TryAdd("404", new OpenApiResponse
        {
            Description = "Not Found - Resource doesn't exist"
        });
        
        operation.Responses.TryAdd("500", new OpenApiResponse
        {
            Description = "Internal Server Error",
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["application/json"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.Schema,
                            Id = "ProblemDetails"
                        }
                    }
                }
            }
        });
    }
}
