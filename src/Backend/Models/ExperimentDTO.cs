namespace Backend.Models
{
    public class ExperimentDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int FileId { get; set; }
    }
}
