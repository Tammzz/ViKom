using backend.Models;
using Microsoft.AspNetCore.Identity;

namespace backend.DAL
{
    public class DBInit
    {
        public static async Task SeedAsync(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            context.Database.EnsureCreated();

            // Check if roles exist, if not create them
            if (!await roleManager.RoleExistsAsync("Personnel"))
            {
                await roleManager.CreateAsync(new IdentityRole("Personnel"));
            }

            if (!await roleManager.RoleExistsAsync("Patient"))
            {
                await roleManager.CreateAsync(new IdentityRole("Patient"));
            }

            // Seed users if none exist
            if (!context.Users.Any())
            {
                var personnel = new User
                {
                    UserName = "personnel@homecare.local",
                    Email = "personnel@homecare.local",
                    FullName = "Nurse Nora",
                    Role = "Personnel",
                    EmailConfirmed = true
                };

                var patient = new User
                {
                    UserName = "patient@homecare.local",
                    Email = "patient@homecare.local",
                    FullName = "Patient Peter",
                    Role = "Patient",
                    EmailConfirmed = true
                };

                await userManager.CreateAsync(personnel, "Pass123!");
                await userManager.CreateAsync(patient, "Pass123!");

                await userManager.AddToRoleAsync(personnel, "Personnel");
                await userManager.AddToRoleAsync(patient, "Patient");
            }

            // Seed availabilities if none exist
            if (!context.Availabilities.Any())
            {
                var personnel = context.Users.FirstOrDefault(u => u.Role == "Personnel");
                if (personnel != null)
                {
                    var availabilities = new List<Availability>
                    {
                        new Availability
                        {
                            PersonnelId = personnel.Id,
                            Date = DateTime.Today.AddDays(1),
                            StartTime = new TimeSpan(9, 0, 0),
                            EndTime = new TimeSpan(12, 0, 0),
                            Notes = "Morning shift"
                        },
                        new Availability
                        {
                            PersonnelId = personnel.Id,
                            Date = DateTime.Today.AddDays(2),
                            StartTime = new TimeSpan(13, 0, 0),
                            EndTime = new TimeSpan(17, 0, 0),
                            Notes = "Afternoon shift"
                        }
                    };

                    context.Availabilities.AddRange(availabilities);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
