using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Image
    {
        public int Id { get; set; }
        [ForeignKey("FK_UserID")]
        public int UserId { get; set; }
        public User User { get; set; } = new User();
        public string FullPath { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
    }
}
