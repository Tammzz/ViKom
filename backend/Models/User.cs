using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    /// <summary>
    /// Represents an application user, extending ASP.NET Identity's built-in IdentityUser.
    /// </summary>
    public class User : IdentityUser
    {
        [RegularExpression(@"^[\p{L}.\- ]+$", ErrorMessage = "The name must contain only letters, spaces, periods, or hyphens.")]
        [Display(Name = "Full Name")]
        public string FullName { get; set; } = string.Empty;

        [Display(Name = "Address")]
        public string? Address { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        [RegularExpression(@"^(Personnel|Patient)$", ErrorMessage = "Role must be either 'Personnel' or 'Patient'.")]
        public string Role { get; set; } = string.Empty; // "Personnel" or "Patient"

        /// <summary>
        /// Optional: UUID from Supabase profiles.id for integration with Cart's TV app.
        /// Null if not yet mapped to a Supabase profile.
        /// </summary>
        [Display(Name = "Supabase Profile ID")]
        public string? SupabaseProfileId { get; set; }
    }
}
