using PatientService.DTOs;
using PatientService.Enum;
using PatientService.Models;
using PatientService.Repositories.Interfaces;
using PatientService.Services.Interfaces;

namespace PatientService.Services
{
    public class MedicalReportService : IMedicalReportService
    {
        private readonly IMedicalReportRepository _repository;

        public MedicalReportService(IMedicalReportRepository repository)
        {
            _repository = repository;
        }

        public async Task<MedicalReportResponseDto?> CreateMedicalReportAsync(CreateMedicalReportDto dto, string? createdBy = null)
        {
            var report = new MedicalReport
            {
                PatientId = dto.PatientId,
                //DoctorId = dto.DoctorId,
                AppointmentId = dto.AppointmentId,
                PatientName = dto.PatientName,
                ReportDate = dto.ReportDate,
                Diagnosis = dto.Diagnosis,
                Reports = dto.Reports,
                Notes = dto.Notes,
                ReportType = dto.ReportType,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy,
                Status = CommonStatus.Active
            };

            var created = await _repository.AddAsync(report);
            return MapToDto(created);
        }

        public async Task<IEnumerable<MedicalReportResponseDto>> GetAllMedicalReportsAsync()
        {
            var reports = await _repository.GetAllAsync();
            return reports.Select(MapToDto);
        }

        public async Task<MedicalReportResponseDto?> GetMedicalReportByIdAsync(int id)
        {
            var report = await _repository.GetByIdAsync(id);
            return report == null ? null : MapToDto(report);
        }

        public async Task<IEnumerable<MedicalReportResponseDto>> GetByPatientIdAsync(int patientId)
        {
            var reports = await _repository.GetByPatientIdAsync(patientId);
            return reports.Select(MapToDto);
        }

        //public async Task<IEnumerable<MedicalReportResponseDto>> GetByDoctorIdAsync(int doctorId)
        //{
        //    var reports = await _repository.GetByDoctorIdAsync(doctorId);
        //    return reports.Select(MapToDto);
        //}

        public async Task<IEnumerable<MedicalReportResponseDto>> GetByAppointmentIdAsync(int appointmentId)
        {
            var reports = await _repository.GetByAppointmentIdAsync(appointmentId);
            return reports.Select(MapToDto);
        }

        public async Task<bool> UpdateMedicalReportAsync(int id, UpdateMedicalReportDto dto, string? updatedBy = null)
        {
            var report = await _repository.GetByIdAsync(id);
            if (report == null) return false;

            
            //report.ReportDate = dto.ReportDate;
            report.PatientName = dto.PatientName;
            report.Diagnosis = dto.Diagnosis;
            report.Reports = dto.Reports;
            report.Notes = dto.Notes;
            report.ReportType = dto.ReportType;
            report.UpdatedAt = DateTime.UtcNow;
            report.UpdatedBy = updatedBy;

            await _repository.UpdateAsync(report);
            return true;
        }

        public async Task<bool> SoftDeleteMedicalReportAsync(int id, string? deletedBy = null)
        {
            var report = await _repository.GetByIdAsync(id);
            if (report == null) return false;

            report.IsDeleted = true;
            report.DeletedAt = DateTime.UtcNow;
            report.DeletedBy = deletedBy;
            report.Status = CommonStatus.Deleted;

            await _repository.UpdateAsync(report);
            return true;
        }

        private static MedicalReportResponseDto MapToDto(MedicalReport report)
        {
            return new MedicalReportResponseDto
            {
                Id = report.Id,
                PatientId = report.PatientId,
                //DoctorId = report.DoctorId,
                AppointmentId = report.AppointmentId,
                ReportDate = report.ReportDate,
                Diagnosis = report.Diagnosis,
                Reports = report.Reports,
                Notes = report.Notes,
                ReportType = report.ReportType,
                Status = report.Status.ToString(),
                CreatedAt = report.CreatedAt
            };
        }
    }
}