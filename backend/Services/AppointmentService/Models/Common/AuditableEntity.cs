namespace AppointmentService.Models.Common;

using AppointmentService.Enum;

public abstract class AuditableEntity
{
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    public CommonStatus Status { get; set; } = CommonStatus.Active;
}
