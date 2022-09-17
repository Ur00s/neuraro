namespace Backend.Models
{
    public class FeatureSelectionRegression
    {
        public List<List<string>> ListOfInputs { get; set; } = new List<List<string>>();
        public List<double> AvgScore { get; set; } = new List<double>();
        public List<double> StandardError { get; set; } = new List<double>();
    }
}
