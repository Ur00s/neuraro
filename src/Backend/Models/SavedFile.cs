using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class SavedFile
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;

        [ForeignKey("FK_UserID")]
        public int UserID { get; set; }
        public User User { get; set; }
    }
}
