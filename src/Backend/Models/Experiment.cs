using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Experiment
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string HyperparametersPath { get; set; } = string.Empty;
        [ForeignKey("FK_UserID")]
        public int UserId { get; set; }
        public User User { get; set; }
        [ForeignKey("FK_FileID")]
        public int FileId { get; set; }
        public SavedFile File { get; set; } = new SavedFile();
        public string ModelPath { get; set; } = string.Empty;
    }
}
