namespace Backend.Models
{
    public class NeuralNetworkModelTraining
    {
        public List<double> Loss { get; set; } = new List<double>();
        public List<double> ValLoss { get; set; } = new List<double>();
        public List<double> MeanSqauredError { get; set; } = new List<double>();
        public List<double> ValMeanSqauerdError { get; set; } = new List<double>();
        public List<int> Epochs { get; set; } = new List<int>();
    }
}
