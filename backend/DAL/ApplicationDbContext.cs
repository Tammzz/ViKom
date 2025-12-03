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
        public DbSet<Appointment> Appointments => Set<Appointment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure one-to-one relationship between Appointment and Availability
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Availability)
                .WithOne(av => av.Appointment)
                .HasForeignKey<Appointment>(a => a.AvailabilityId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
