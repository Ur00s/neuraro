namespace Backend.Models
{
    public class MissingValues
    {
        public string Method { get; set; } = string.Empty;
        public List<MissingColumnValue> MissingValueOption { get; set; } = new List<MissingColumnValue>();
        public string FilePath { get; set; } = string.Empty;
    }
}
