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

        [Required(ErrorMessage = "Role is required.")]
        [RegularExpression(@"^(Personnel|Patient)$", ErrorMessage = "Role must be either 'Personnel' or 'Patient'.")]
        public string Role { get; set; } = string.Empty; // "Personnel" or "Patient"
    }
}
