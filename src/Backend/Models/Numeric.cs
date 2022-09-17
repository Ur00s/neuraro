using System.Runtime.Serialization;

namespace Backend.Models
{
    public class Numeric
    {   
        public double count { get; set; }
        public double max { get; set; }
        public double mean { get; set; }
        public double min { get; set; }
        public double std { get; set; }
        public string name { get; set; } = string.Empty;
        public double numberOfNan { get; set; }
        public double median { get; set; }
        public double firstQuartile { get; set; }
        public double thirdQuartile { get; set; }
    }
}