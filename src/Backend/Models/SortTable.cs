namespace Backend.Models
{
    public class SortTable
    {
        public int FileId { get; set; }
        public string Column { get; set; } = string.Empty;
        public bool Ascending { get; set; }
        public int From { get; set; }
        public int To { get; set; }
    }
}
