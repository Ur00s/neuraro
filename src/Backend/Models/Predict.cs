namespace Backend.Models
{
    public class Predict
    {
        public int ExperimentId { get; set; }
        public List<ValuesForPrediction> Values { get; set; } = new List<ValuesForPrediction>();
    }
}
