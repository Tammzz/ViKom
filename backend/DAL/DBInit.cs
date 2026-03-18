using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

            await ReplaceLegacyAvailabilityNotesAsync(context);
            await RemoveDuplicateSlotDataAsync(context);

            // Seed users if none exist
            if (!context.Users.Any())
            {
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

                await userManager.CreateAsync(personnel, "Pass123!");
                await userManager.CreateAsync(patient, "Pass123!");

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
                            Notes = "Sone A, Hagegata 25, 0653 Oslo"
                        },
                        new AvailabilityWindow
                        {
                            PersonnelId = personnel.Id,
                            Date = DateTime.Today.AddDays(2),
                            StartTime = new TimeSpan(9, 0, 0),
                            EndTime = new TimeSpan(17, 0, 0),
                            IsAvailable = true,
                            Notes = "Sone A, Rolf Hofmos gate 18, 0655 Oslo"
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

                    // Seed test appointments
                    var patient = context.Users.FirstOrDefault(u => u.Role == "Patient");
                    if (patient != null)
                    {
                        // 1. Create window for 3 days ago with full day range (9:00-17:00)
                        var pastWindow = new AvailabilityWindow
                        {
                            PersonnelId = personnel.Id,
                            Date = DateTime.Today.AddDays(-3),
                            StartTime = new TimeSpan(9, 0, 0),
                            EndTime = new TimeSpan(17, 0, 0),
                            IsAvailable = true,
                            Notes = "Sone A, Enebakkveien 36, 0657 Oslo"
                        };
                        context.AvailabilityWindows.Add(pastWindow);
                        await context.SaveChangesAsync();

                        // Generate slots for past window
                        var pastSlots = GenerateSlots(pastWindow);
                        context.Availabilities.AddRange(pastSlots);
                        await context.SaveChangesAsync();

                        // Create completed appointment in first slot (9:00-10:00)
                        var completedSlot = pastSlots.FirstOrDefault(s => s.StartTime == new TimeSpan(9, 0, 0));
                        if (completedSlot != null)
                        {
                            var completedAppointment = new Appointment
                            {
                                PatientId = patient.Id,
                                AvailabilityId = completedSlot.Id,
                                Tasks = "Bathing, Dressing",
                                StartTime = new TimeSpan(9, 0, 0),
                                EndTime = new TimeSpan(10, 0, 0),
                                Status = "Completed"
                            };
                            context.Appointments.Add(completedAppointment);
                        }

                        // Create cancelled appointment in second slot (10:00-11:00)
                        var cancelledSlot = pastSlots.FirstOrDefault(s => s.StartTime == new TimeSpan(10, 30, 0));
                        if (cancelledSlot != null)
                        {
                            var cancelledAppointment = new Appointment
                            {
                                PatientId = patient.Id,
                                AvailabilityId = cancelledSlot.Id,
                                Tasks = "Handletur",
                                StartTime = new TimeSpan(10, 30, 0),
                                EndTime = new TimeSpan(11, 30, 0),
                                Status = "Cancelled"
                            };
                            context.Appointments.Add(cancelledAppointment);
                        }
                        await context.SaveChangesAsync();

                        // 2. Create booked appointment for tomorrow (upcoming appointment)
                        var tomorrowSlot = context.Availabilities
                            .Where(a => a.PersonnelId == personnel.Id && a.Date == DateTime.Today.AddDays(1))
                            .OrderBy(a => a.StartTime)
                            .Skip(1)
                            .FirstOrDefault();

                        if (tomorrowSlot != null)
                        {
                            var upcomingAppointment = new Appointment
                            {
                                PatientId = patient.Id,
                                AvailabilityId = tomorrowSlot.Id,
                                Tasks = "Medisinhåndtering, Rengjøring",
                                StartTime = tomorrowSlot.StartTime,
                                EndTime = tomorrowSlot.EndTime,
                                Status = "Booked"
                            };
                            context.Appointments.Add(upcomingAppointment);
                            await context.SaveChangesAsync();
                        }
                    }
                }
            }

            // Ensure timeline demo appointments always exist for today
            await SeedTodayTimelineDemoAppointmentsAsync(context);

            // Ensure two demo appointments always exist for tomorrow
            await SeedTomorrowDemoAppointmentsAsync(context);

            // Enforce the upcoming 7-day availability pattern used by the dashboard module.
            await EnsureUpcomingWeekAvailabilityPatternAsync(context);
        }

        private static async Task ReplaceLegacyAvailabilityNotesAsync(ApplicationDbContext context)
        {
            const string legacyNote = "Available for appointments";
            const string defaultAddressNote = "Sone A, Hagegata 25, 0653 Oslo";

            var availabilityWindowsWithLegacyNote = await context.AvailabilityWindows
                .Where(window => window.Notes == legacyNote)
                .ToListAsync();

            foreach (var window in availabilityWindowsWithLegacyNote)
            {
                window.Notes = defaultAddressNote;
            }

            var availabilitiesWithLegacyNote = await context.Availabilities
                .Where(availability => availability.Notes == legacyNote)
                .ToListAsync();

            foreach (var availability in availabilitiesWithLegacyNote)
            {
                availability.Notes = defaultAddressNote;
            }

            if (availabilityWindowsWithLegacyNote.Count > 0 || availabilitiesWithLegacyNote.Count > 0)
            {
                await context.SaveChangesAsync();
            }
        }

        private static async Task RemoveDuplicateSlotDataAsync(ApplicationDbContext context)
        {
            var allAvailabilities = await context.Availabilities
                .Include(availability => availability.Appointment)
                .OrderBy(availability => availability.Id)
                .ToListAsync();

            var duplicateSlotGroups = allAvailabilities
                .GroupBy(availability => new
                {
                    availability.PersonnelId,
                    availability.Date,
                    availability.StartTime
                })
                .Where(group => group.Count() > 1)
                .ToList();

            foreach (var duplicateGroup in duplicateSlotGroups)
            {
                var keeper = duplicateGroup
                    .OrderByDescending(availability => availability.Appointment != null)
                    .ThenBy(availability => availability.Id)
                    .First();

                var keeperAppointment = keeper.Appointment;

                foreach (var duplicate in duplicateGroup.Where(availability => availability.Id != keeper.Id))
                {
                    if (duplicate.Appointment != null)
                    {
                        if (keeperAppointment == null)
                        {
                            duplicate.Appointment.AvailabilityId = keeper.Id;
                            keeperAppointment = duplicate.Appointment;
                        }
                        else
                        {
                            if (ShouldReplaceAppointment(keeperAppointment, duplicate.Appointment))
                            {
                                context.Appointments.Remove(keeperAppointment);
                                duplicate.Appointment.AvailabilityId = keeper.Id;
                                keeperAppointment = duplicate.Appointment;
                            }
                            else
                            {
                                context.Appointments.Remove(duplicate.Appointment);
                            }
                        }
                    }

                    context.Availabilities.Remove(duplicate);
                }
            }

            var duplicateAppointments = await context.Appointments
                .Include(appointment => appointment.Availability)
                .OrderBy(appointment => appointment.Id)
                .ToListAsync();

            var duplicateAppointmentRows = duplicateAppointments
                .GroupBy(appointment => new
                {
                    appointment.Availability.PersonnelId,
                    appointment.Availability.Date,
                    appointment.StartTime,
                    appointment.PatientId
                })
                .SelectMany(group =>
                {
                    var keep = group
                        .OrderByDescending(appointment => AppointmentStatusRank(appointment.Status))
                        .ThenByDescending(appointment => appointment.Id)
                        .First();

                    return group.Where(appointment => appointment.Id != keep.Id);
                })
                .ToList();

            if (duplicateAppointmentRows.Count > 0)
            {
                context.Appointments.RemoveRange(duplicateAppointmentRows);
            }

            if (duplicateSlotGroups.Count > 0 || duplicateAppointmentRows.Count > 0)
            {
                await context.SaveChangesAsync();
            }
        }

        private static bool ShouldReplaceAppointment(Appointment current, Appointment candidate)
        {
            var currentRank = AppointmentStatusRank(current.Status);
            var candidateRank = AppointmentStatusRank(candidate.Status);

            if (candidateRank != currentRank)
            {
                return candidateRank > currentRank;
            }

            return candidate.Id > current.Id;
        }

        private static int AppointmentStatusRank(string status)
        {
            return status switch
            {
                "InProgress" => 4,
                "Booked" => 3,
                "Completed" => 2,
                "Cancelled" => 1,
                _ => 0
            };
        }

        private static async Task SeedTodayTimelineDemoAppointmentsAsync(ApplicationDbContext context)
        {
            var personnel = await context.Users.FirstOrDefaultAsync(u => u.Role == "Personnel");
            var patient = await context.Users.FirstOrDefaultAsync(u => u.Role == "Patient");

            if (personnel == null || patient == null)
            {
                return;
            }

            var today = DateTime.Today;

            var timelineEntries = new[]
            {
                new
                {
                    Start = new TimeSpan(9, 0, 0),
                    End = new TimeSpan(10, 0, 0),
                    Tasks = "Medisinhåndtering, Blodtrykksmåling",
                    VisitType = "Fysisk",
                    Note = "Sone A, Hagegata 25, 0653 Oslo"
                },
                new
                {
                    Start = new TimeSpan(10, 30, 0),
                    End = new TimeSpan(11, 30, 0),
                    Tasks = "Sårstell, Tilsyn",
                    VisitType = "Fysisk",
                    Note = "Sone A, Rolf Hofmos gate 18, 0655 Oslo"
                },
                new
                {
                    Start = new TimeSpan(12, 0, 0),
                    End = new TimeSpan(13, 0, 0),
                    Tasks = "Hjelp til måltid, Oppfølging av ernæring",
                    VisitType = "Digitalt",
                    Note = "Digitalt"
                }
            };

            var obsoleteTimelineSlots = new[]
            {
                new { Start = new TimeSpan(9, 30, 0), End = new TimeSpan(10, 0, 0) },
                new { Start = new TimeSpan(11, 15, 0), End = new TimeSpan(11, 45, 0) }
            };

            foreach (var obsoleteSlot in obsoleteTimelineSlots)
            {
                var obsoleteAvailability = await context.Availabilities
                    .Include(a => a.Appointment)
                    .FirstOrDefaultAsync(a =>
                        a.PersonnelId == personnel.Id &&
                        a.Date == today &&
                        a.StartTime == obsoleteSlot.Start &&
                        a.EndTime == obsoleteSlot.End);

                if (obsoleteAvailability?.Appointment != null && obsoleteAvailability.Appointment.PatientId == patient.Id)
                {
                    context.Appointments.Remove(obsoleteAvailability.Appointment);
                    context.Availabilities.Remove(obsoleteAvailability);
                    await context.SaveChangesAsync();
                }
            }

            // Remove accidental duplicate appointments that share identical time slots for today.
            var duplicateTodayAppointments = await context.Appointments
                .Include(a => a.Availability)
                .Where(a =>
                    a.Availability.PersonnelId == personnel.Id &&
                    a.Availability.Date == today)
                .OrderBy(a => a.Id)
                .ToListAsync();

            var duplicateAppointmentsToRemove = duplicateTodayAppointments
                .GroupBy(a => a.StartTime)
                .SelectMany(group => group.Skip(1))
                .ToList();

            if (duplicateAppointmentsToRemove.Count > 0)
            {
                context.Appointments.RemoveRange(duplicateAppointmentsToRemove);
                await context.SaveChangesAsync();
            }

            // Remove previous seeded demo appointments that no longer match the transport-gap schedule.
            var validTimelineStarts = timelineEntries.Select(entry => entry.Start).ToHashSet();
            var outdatedTodayAppointments = await context.Appointments
                .Include(appointment => appointment.Availability)
                .Where(appointment =>
                    appointment.Availability.PersonnelId == personnel.Id
                    && appointment.Availability.Date == today
                    && appointment.PatientId == patient.Id
                    && !validTimelineStarts.Contains(appointment.StartTime))
                .ToListAsync();

            if (outdatedTodayAppointments.Count > 0)
            {
                context.Appointments.RemoveRange(outdatedTodayAppointments);
                await context.SaveChangesAsync();
            }

            foreach (var entry in timelineEntries)
            {
                var availability = await context.Availabilities
                    .Include(a => a.Appointment)
                    .FirstOrDefaultAsync(a =>
                        a.PersonnelId == personnel.Id &&
                        a.Date == today &&
                        a.StartTime == entry.Start);

                if (availability == null)
                {
                    availability = new Availability
                    {
                        PersonnelId = personnel.Id,
                        Date = today,
                        StartTime = entry.Start,
                        EndTime = entry.End,
                        Notes = entry.Note
                    };

                    context.Availabilities.Add(availability);
                    await context.SaveChangesAsync();
                }

                if (availability.Notes != entry.Note)
                {
                    availability.Notes = entry.Note;
                    await context.SaveChangesAsync();
                }

                if (availability.Appointment != null)
                {
                    var existingAppointment = availability.Appointment;
                    var shouldUpdateAppointment =
                        existingAppointment.PatientId != patient.Id ||
                        existingAppointment.Tasks != entry.Tasks ||
                        existingAppointment.StartTime != entry.Start ||
                        existingAppointment.EndTime != entry.End ||
                        existingAppointment.Status != "Booked";

                    if (shouldUpdateAppointment)
                    {
                        existingAppointment.PatientId = patient.Id;
                        existingAppointment.Tasks = entry.Tasks;
                        existingAppointment.StartTime = entry.Start;
                        existingAppointment.EndTime = entry.End;
                        existingAppointment.Status = "Booked";
                        await context.SaveChangesAsync();
                    }

                    continue;
                }

                var appointment = new Appointment
                {
                    PatientId = patient.Id,
                    AvailabilityId = availability.Id,
                    Tasks = entry.Tasks,
                    StartTime = entry.Start,
                    EndTime = entry.End,
                    Status = "Booked"
                };

                context.Appointments.Add(appointment);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedTomorrowDemoAppointmentsAsync(ApplicationDbContext context)
        {
            var personnel = await context.Users.FirstOrDefaultAsync(u => u.Role == "Personnel");
            var patient = await context.Users.FirstOrDefaultAsync(u => u.Role == "Patient");

            if (personnel == null || patient == null)
            {
                return;
            }

            var tomorrow = DateTime.Today.AddDays(1);

            var tomorrowEntries = new[]
            {
                new
                {
                    Start = new TimeSpan(11, 0, 0),
                    End = new TimeSpan(12, 0, 0),
                    Tasks = "Måltidsstøtte, Oppfølging av ernæring",
                    VisitType = "Fysisk",
                    Note = "Sone B, Slettaveien 12, 0595 Oslo"
                },
                new
                {
                    Start = new TimeSpan(12, 30, 0),
                    End = new TimeSpan(13, 30, 0),
                    Tasks = "Sårstell, Medisinhåndtering",
                    VisitType = "Digitalt",
                    Note = "Digitalt"
                }
            };

            if (!TryGetScheduledWindowForDay(tomorrow.DayOfWeek, out _, out _))
            {
                foreach (var entry in tomorrowEntries)
                {
                    var availability = await context.Availabilities
                        .Include(a => a.Appointment)
                        .FirstOrDefaultAsync(a =>
                            a.PersonnelId == personnel.Id &&
                            a.Date == tomorrow &&
                            a.StartTime == entry.Start);

                    if (availability?.Appointment != null && availability.Appointment.PatientId == patient.Id)
                    {
                        context.Appointments.Remove(availability.Appointment);
                    }

                    if (availability != null)
                    {
                        context.Availabilities.Remove(availability);
                    }
                }

                await context.SaveChangesAsync();
                return;
            }

            // Remove previous seeded demo appointments that no longer match the transport-gap schedule.
            var validTomorrowStarts = tomorrowEntries.Select(entry => entry.Start).ToHashSet();
            var outdatedTomorrowAppointments = await context.Appointments
                .Include(appointment => appointment.Availability)
                .Where(appointment =>
                    appointment.Availability.PersonnelId == personnel.Id
                    && appointment.Availability.Date == tomorrow
                    && appointment.PatientId == patient.Id
                    && !validTomorrowStarts.Contains(appointment.StartTime))
                .ToListAsync();

            if (outdatedTomorrowAppointments.Count > 0)
            {
                context.Appointments.RemoveRange(outdatedTomorrowAppointments);
                await context.SaveChangesAsync();
            }

            foreach (var entry in tomorrowEntries)
            {
                var availability = await context.Availabilities
                    .Include(a => a.Appointment)
                    .FirstOrDefaultAsync(a =>
                        a.PersonnelId == personnel.Id &&
                        a.Date == tomorrow &&
                        a.StartTime == entry.Start);

                if (availability == null)
                {
                    availability = new Availability
                    {
                        PersonnelId = personnel.Id,
                        Date = tomorrow,
                        StartTime = entry.Start,
                        EndTime = entry.End,
                        Notes = entry.Note
                    };

                    context.Availabilities.Add(availability);
                    await context.SaveChangesAsync();
                }

                if (availability.Notes != entry.Note)
                {
                    availability.Notes = entry.Note;
                    await context.SaveChangesAsync();
                }

                if (availability.Appointment != null)
                {
                    var existingAppointment = availability.Appointment;
                    var shouldUpdateAppointment =
                        existingAppointment.PatientId != patient.Id ||
                        existingAppointment.Tasks != entry.Tasks ||
                        existingAppointment.StartTime != entry.Start ||
                        existingAppointment.EndTime != entry.End ||
                        existingAppointment.Status != "Booked";

                    if (shouldUpdateAppointment)
                    {
                        existingAppointment.PatientId = patient.Id;
                        existingAppointment.Tasks = entry.Tasks;
                        existingAppointment.StartTime = entry.Start;
                        existingAppointment.EndTime = entry.End;
                        existingAppointment.Status = "Booked";
                        await context.SaveChangesAsync();
                    }

                    continue;
                }

                var appointment = new Appointment
                {
                    PatientId = patient.Id,
                    AvailabilityId = availability.Id,
                    Tasks = entry.Tasks,
                    StartTime = entry.Start,
                    EndTime = entry.End,
                    Status = "Booked"
                };

                context.Appointments.Add(appointment);
                await context.SaveChangesAsync();
            }
        }

        private static async Task EnsureUpcomingWeekAvailabilityPatternAsync(ApplicationDbContext context)
        {
            var personnel = await context.Users.FirstOrDefaultAsync(u => u.Role == "Personnel");
            if (personnel == null)
            {
                return;
            }

            var today = DateTime.Today;
            var weekEnd = today.AddDays(6);
            const string defaultAddressNote = "Sone A, Hagegata 25, 0653 Oslo";
            const string unavailableNote = "Fridag";

            var weekAvailabilities = await context.Availabilities
                .Include(availability => availability.Appointment)
                .Where(availability =>
                    availability.PersonnelId == personnel.Id
                    && availability.Date >= today
                    && availability.Date <= weekEnd)
                .ToListAsync();

            var weekWindows = await context.AvailabilityWindows
                .Where(window =>
                    window.PersonnelId == personnel.Id
                    && window.Date >= today
                    && window.Date <= weekEnd)
                .OrderBy(window => window.Date)
                .ThenBy(window => window.Id)
                .ToListAsync();

            for (var offset = 0; offset < 7; offset++)
            {
                var currentDate = today.AddDays(offset).Date;
                var dayAvailabilities = weekAvailabilities
                    .Where(availability => availability.Date == currentDate)
                    .ToList();
                var dayWindows = weekWindows
                    .Where(window => window.Date == currentDate)
                    .ToList();

                var isAvailableDay = TryGetScheduledWindowForDay(
                    currentDate.DayOfWeek,
                    out var windowStart,
                    out var windowEnd);

                var primaryWindow = dayWindows.FirstOrDefault();
                if (primaryWindow == null)
                {
                    primaryWindow = new AvailabilityWindow
                    {
                        PersonnelId = personnel.Id,
                        Date = currentDate
                    };

                    context.AvailabilityWindows.Add(primaryWindow);
                    await context.SaveChangesAsync();
                    weekWindows.Add(primaryWindow);
                    dayWindows.Add(primaryWindow);
                }

                primaryWindow.IsAvailable = isAvailableDay;
                primaryWindow.StartTime = isAvailableDay ? windowStart : TimeSpan.Zero;
                primaryWindow.EndTime = isAvailableDay ? windowEnd : TimeSpan.Zero;
                primaryWindow.Notes = isAvailableDay ? defaultAddressNote : unavailableNote;

                var desiredSlots = isAvailableDay
                    ? BuildBufferedSlots(windowStart, windowEnd)
                    : new List<(TimeSpan Start, TimeSpan End)>();

                var desiredSlotSet = desiredSlots
                    .Select(slot => slot.Start)
                    .ToHashSet();

                var staleUnbookedSlots = dayAvailabilities
                    .Where(availability =>
                        availability.Appointment == null
                        && !desiredSlotSet.Contains(availability.StartTime))
                    .ToList();

                if (staleUnbookedSlots.Count > 0)
                {
                    context.Availabilities.RemoveRange(staleUnbookedSlots);
                    weekAvailabilities.RemoveAll(availability => staleUnbookedSlots.Any(stale => stale.Id == availability.Id));
                    dayAvailabilities.RemoveAll(availability => staleUnbookedSlots.Any(stale => stale.Id == availability.Id));
                }

                if (isAvailableDay)
                {
                    foreach (var desiredSlot in desiredSlots)
                    {
                        var existingSlot = dayAvailabilities.FirstOrDefault(availability =>
                            availability.StartTime == desiredSlot.Start);

                        if (existingSlot == null)
                        {
                            var slot = new Availability
                            {
                                PersonnelId = personnel.Id,
                                Date = currentDate,
                                StartTime = desiredSlot.Start,
                                EndTime = desiredSlot.End,
                                Notes = defaultAddressNote,
                                AvailabilityWindowId = primaryWindow.Id
                            };

                            context.Availabilities.Add(slot);
                            weekAvailabilities.Add(slot);
                            dayAvailabilities.Add(slot);
                        }
                        else
                        {
                            existingSlot.AvailabilityWindowId = primaryWindow.Id;
                            if (string.IsNullOrWhiteSpace(existingSlot.Notes))
                            {
                                existingSlot.Notes = defaultAddressNote;
                            }
                        }
                    }
                }

                foreach (var extraWindow in dayWindows.Skip(1))
                {
                    var linkedAvailabilities = dayAvailabilities
                        .Where(availability => availability.AvailabilityWindowId == extraWindow.Id)
                        .ToList();

                    if (linkedAvailabilities.Any(availability => availability.Appointment != null))
                    {
                        continue;
                    }

                    if (linkedAvailabilities.Count > 0)
                    {
                        context.Availabilities.RemoveRange(linkedAvailabilities);
                        weekAvailabilities.RemoveAll(availability => linkedAvailabilities.Any(linked => linked.Id == availability.Id));
                        dayAvailabilities.RemoveAll(availability => linkedAvailabilities.Any(linked => linked.Id == availability.Id));
                    }

                    context.AvailabilityWindows.Remove(extraWindow);
                    weekWindows.Remove(extraWindow);
                }
            }

            await context.SaveChangesAsync();
        }

        private static bool TryGetScheduledWindowForDay(
            DayOfWeek dayOfWeek,
            out TimeSpan startTime,
            out TimeSpan endTime)
        {
            switch (dayOfWeek)
            {
                case DayOfWeek.Monday:
                case DayOfWeek.Friday:
                    startTime = new TimeSpan(9, 0, 0);
                    endTime = new TimeSpan(17, 0, 0);
                    return true;
                case DayOfWeek.Tuesday:
                case DayOfWeek.Thursday:
                    startTime = new TimeSpan(8, 0, 0);
                    endTime = new TimeSpan(16, 0, 0);
                    return true;
                default:
                    startTime = TimeSpan.Zero;
                    endTime = TimeSpan.Zero;
                    return false;
            }
        }

        private static List<(TimeSpan Start, TimeSpan End)> BuildBufferedSlots(TimeSpan startTime, TimeSpan endTime)
        {
            var slots = new List<(TimeSpan Start, TimeSpan End)>();
            var slotDuration = TimeSpan.FromHours(1);
            var travelDuration = TimeSpan.FromMinutes(30);
            var current = startTime;

            while (current < endTime)
            {
                var slotEnd = current.Add(slotDuration);
                if (slotEnd > endTime)
                {
                    break;
                }

                slots.Add((current, slotEnd));
                current = slotEnd.Add(travelDuration);
            }

            return slots;
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
                // Available: 1-hour appointments with 30-minute travel buffer between visits.
                var slotDuration = TimeSpan.FromHours(1);
                var travelDuration = TimeSpan.FromMinutes(30);
                var currentTime = window.StartTime;
                while (currentTime < window.EndTime)
                {
                    var slotEnd = currentTime.Add(slotDuration);
                    if (slotEnd > window.EndTime)
                        break;

                    slots.Add(new Availability
                    {
                        PersonnelId = window.PersonnelId,
                        Date = window.Date,
                        StartTime = currentTime,
                        EndTime = slotEnd,
                        Notes = window.Notes,
                        AvailabilityWindowId = window.Id
                    });

                    currentTime = slotEnd.Add(travelDuration);
                }
            }

            return slots;
        }
    }
}
