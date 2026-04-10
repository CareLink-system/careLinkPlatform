using Microsoft.EntityFrameworkCore;
using PatientService.Data;
using PatientService.Models;
using PatientService.Repositories.Interfaces;

namespace PatientService.Repositories
{
    public class MedicalReportRepository : IMedicalReportRepository
    {
        private readonly PatientDbContext _context;

        public MedicalReportRepository(PatientDbContext context)
        {
            _context = context;
        }

        public async Task<MedicalReport> AddAsync(MedicalReport report)
        {
            _context.MedicalReports.Add(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<IEnumerable<MedicalReport>> GetAllAsync()
        {
            return await _context.MedicalReports
                .Where(r => !r.IsDeleted)
                .ToListAsync();
        }

        public async Task<MedicalReport?> GetByIdAsync(int id)
        {
            return await _context.MedicalReports
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
        }

        public async Task<IEnumerable<MedicalReport>> GetByPatientIdAsync(int patientId)
        {
            return await _context.MedicalReports
                .Where(r => r.PatientId == patientId && !r.IsDeleted)
                .ToListAsync();
        }

        //public async Task<IEnumerable<MedicalReport>> GetByDoctorIdAsync(int doctorId)
        //{
        //    return await _context.MedicalReports
        //        .Where(r => r.DoctorId == doctorId && !r.IsDeleted)
        //        .ToListAsync();
        //}

        public async Task<IEnumerable<MedicalReport>> GetByAppointmentIdAsync(int appointmentId)
        {
            return await _context.MedicalReports
                .Where(r => r.AppointmentId == appointmentId && !r.IsDeleted)
                .ToListAsync();
        }

        public async Task UpdateAsync(MedicalReport report)
        {
            _context.MedicalReports.Update(report);
            await _context.SaveChangesAsync();
        }
    }
}