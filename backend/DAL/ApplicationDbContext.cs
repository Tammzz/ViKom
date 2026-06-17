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
        }
    }
}
