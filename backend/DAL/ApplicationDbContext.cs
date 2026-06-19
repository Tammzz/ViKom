using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using backend.Models;

namespace backend.DAL
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) 
        { 
        }

        public DbSet<Availability> Availabilities => Set<Availability>();
        public DbSet<AvailabilityWindow> AvailabilityWindows => Set<AvailabilityWindow>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<PatientUserLink> PatientUserLinks => Set<PatientUserLink>();
        public DbSet<CallLog> CallLogs => Set<CallLog>();
        public DbSet<Visit> Visits => Set<Visit>();
        public DbSet<VisitTask> VisitTasks => Set<VisitTask>();
        public DbSet<PatientMedication> PatientMedications => Set<PatientMedication>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure one-to-one relationship between Appointment and Availability
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Availability)
                .WithOne(av => av.Appointment)
                .HasForeignKey<Appointment>(a => a.AvailabilityId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure one-to-many relationship between AvailabilityWindow and Availability
            modelBuilder.Entity<AvailabilityWindow>()
                .HasMany(w => w.Slots)
                .WithOne(a => a.AvailabilityWindow)
                .HasForeignKey(a => a.AvailabilityWindowId)
                .OnDelete(DeleteBehavior.Cascade);

            // CallLog has two FKs to AspNetUsers (patient + personnel); use Restrict
            // to avoid multiple cascade paths on the same table.
            modelBuilder.Entity<CallLog>()
                .HasOne(c => c.Patient)
                .WithMany()
                .HasForeignKey(c => c.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CallLog>()
                .HasOne(c => c.Personnel)
                .WithMany()
                .HasForeignKey(c => c.PersonnelId)
                .OnDelete(DeleteBehavior.Restrict);

            // Visit links to its source appointment one-to-one. Restrict so a
            // cancelled appointment can't silently take its visit history with it.
            modelBuilder.Entity<Visit>()
                .HasOne(v => v.Appointment)
                .WithOne(a => a.Visit)
                .HasForeignKey<Visit>(v => v.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Visit FKs to AspNetUsers (patient + responsible nurse); Restrict
            // to avoid multiple cascade paths on the same table.
            modelBuilder.Entity<Visit>()
                .HasOne(v => v.Patient)
                .WithMany()
                .HasForeignKey(v => v.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Visit>()
                .HasOne(v => v.ResponsibleUser)
                .WithMany()
                .HasForeignKey(v => v.ResponsibleUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Visit owns its tasks; removing a visit removes its task rows.
            modelBuilder.Entity<Visit>()
                .HasMany(v => v.Tasks)
                .WithOne(t => t.Visit)
                .HasForeignKey(t => t.VisitId)
                .OnDelete(DeleteBehavior.Cascade);

            // A call attempt may belong to a visit; keep the call log if the
            // visit is ever removed (set null rather than cascade).
            modelBuilder.Entity<CallLog>()
                .HasOne(c => c.Visit)
                .WithMany()
                .HasForeignKey(c => c.VisitId)
                .OnDelete(DeleteBehavior.SetNull);

            // A patient owns their medication list; remove rows with the patient.
            modelBuilder.Entity<PatientMedication>()
                .HasOne(m => m.Patient)
                .WithMany(u => u.Medications)
                .HasForeignKey(m => m.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
