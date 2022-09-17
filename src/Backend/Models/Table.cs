using System.Runtime.Serialization;

namespace Backend.Models
{
    public class Table
    {
        public List<string> Columns { get; set; } = new List<string>();
        //public List<List<object>> Data { get; set; } = new List<List<object>>();
        public int Rows { get; set; }
        public int PageNumbers { get; set; }
        public List<Numeric> NumericColumns { get; set; } = new List<Numeric>();
        public List<string> CategoryColumns { get; set; } = new List<string>();
        public List<CategoryStats> CategoryStats { get; set; } = new List<CategoryStats>();
    }
}
