namespace Backend.Models
{
    public class CategoryStats
    {
        public string name { get; set; } = string.Empty;
        public double count { get; set; }
        public double unique { get; set; }
        public string top { get; set; } = string.Empty;
        public double freq { get; set; }
        public double numberOfNan { get; set; }
        public List<object> values { get; set; }
    }
}
