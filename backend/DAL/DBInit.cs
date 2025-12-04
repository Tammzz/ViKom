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

            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            // Seed users if none exist
            if (!context.Users.Any())
            {
                var admin = new User
                {
                    UserName = "admin@homecare.local",
                    Email = "admin@homecare.local",
                    FullName = "Admin Alice",
                    Role = "Admin",
                    EmailConfirmed = true
                };

                var personnel = new User
                {
                    UserName = "nurse@homecare.local",
                    Email = "nurse@homecare.local",
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

                await userManager.CreateAsync(admin, "Pass123!");
                await userManager.CreateAsync(personnel, "Pass123!");
                await userManager.CreateAsync(patient, "Pass123!");

                await userManager.AddToRoleAsync(admin, "Admin");
                await userManager.AddToRoleAsync(personnel, "Personnel");
                await userManager.AddToRoleAsync(patient, "Patient");
            }

            // Seed availability windows if none exist (NEW SYSTEM)
            if (!context.AvailabilityWindows.Any())
            {
                var personnel = context.Users.FirstOrDefault(u => u.Role == "Personnel");
                if (personnel != null)
                {
                    var windows = new List<AvailabilityWindow>
                    {
                        new AvailabilityWindow
                        {
                            PersonnelId = personnel.Id,
                            Date = DateTime.Today.AddDays(1),
                            StartTime = new TimeSpan(9, 0, 0),
                            EndTime = new TimeSpan(17, 0, 0),
                            IsAvailable = true,
                            Notes = "Available for appointments"
                        },
                        new AvailabilityWindow
                        {
                            PersonnelId = personnel.Id,
                            Date = DateTime.Today.AddDays(2),
                            StartTime = new TimeSpan(9, 0, 0),
                            EndTime = new TimeSpan(17, 0, 0),
                            IsAvailable = true,
                            Notes = "Available for appointments"
                        },
                        new AvailabilityWindow
                        {
                            PersonnelId = personnel.Id,
                            Date = DateTime.Today.AddDays(3),
                            StartTime = new TimeSpan(0, 0, 0),
                            EndTime = new TimeSpan(0, 0, 0),
                            IsAvailable = false,
                            Notes = "Day off"
                        }
                    };

                    context.AvailabilityWindows.AddRange(windows);
                    await context.SaveChangesAsync();

                    // Generate slots for each window
                    foreach (var window in windows)
                    {
                        var slots = GenerateSlots(window);
                        context.Availabilities.AddRange(slots);
                    }
                    await context.SaveChangesAsync();

                    // Seed a test appointment for December 5, 2025, 10:00-11:00
                    var patient = context.Users.FirstOrDefault(u => u.Role == "Patient");
                    if (patient != null)
                    {
                        // Find the availability slot for Dec 5, 10:00-11:00
                        var targetDate = DateTime.Today.AddDays(1); // Dec 5, 2025
                        var availabilitySlot = context.Availabilities
                            .FirstOrDefault(a => a.PersonnelId == personnel.Id 
                                && a.Date == targetDate 
                                && a.StartTime == new TimeSpan(10, 0, 0)
                                && a.EndTime == new TimeSpan(11, 0, 0));

                        if (availabilitySlot != null)
                        {
                            // Creates appointment with comma-separated task list
                            var appointment = new Appointment
                            {
                                PatientId = patient.Id,
                                AvailabilityId = availabilitySlot.Id,
                                Tasks = "Cleaning, Groceries, Medication",
                                StartTime = new TimeSpan(10, 0, 0),
                                EndTime = new TimeSpan(11, 0, 0),
                                Status = "Booked"
                            };

                            context.Appointments.Add(appointment);
                            await context.SaveChangesAsync();
                        }
                    }
                }
            }
        }

        private static List<Availability> GenerateSlots(AvailabilityWindow window)
        {
            var slots = new List<Availability>();

            if (!window.IsAvailable)
            {
                // Unavailable: create single slot covering the whole period
                slots.Add(new Availability
                {
                    PersonnelId = window.PersonnelId,
                    Date = window.Date,
                    StartTime = window.StartTime,
                    EndTime = window.EndTime,
                    Notes = window.Notes,
                    AvailabilityWindowId = window.Id
                });
            }
            else
            {
                // Available: subdivide into 1-hour slots
                var currentTime = window.StartTime;
                while (currentTime < window.EndTime)
                {
                    var slotEnd = currentTime.Add(TimeSpan.FromHours(1));
                    if (slotEnd > window.EndTime)
                        slotEnd = window.EndTime;

                    slots.Add(new Availability
                    {
                        PersonnelId = window.PersonnelId,
                        Date = window.Date,
                        StartTime = currentTime,
                        EndTime = slotEnd,
                        Notes = window.Notes,
                        AvailabilityWindowId = window.Id
                    });

                    currentTime = slotEnd;
                }
            }

            return slots;
        }
    }
}
