namespace Backend.Models
{
    public class NeuralNetwork
    {
        public double LearningRate { get; set; }
        public double RegularizationRate { get; set; }
        public int NumberOfLayers { get; set; }
        public List<NeuralNetworkLayer> Layers { get; set; } = new List<NeuralNetworkLayer>();
        public double Noise { get; set; }
        public double BatchSize { get; set; }
        public string Regularization { get; set; } = string.Empty;
        public double TestToTrain { get; set; }
        public double Dropout { get; set; }
        public double Momentum { get; set; }
        public bool PreventLossIncreases { get; set; }
        public List<string> Inputs { get; set; } = new List<string>();
        public string EncodingMethod { get; set; } = string.Empty;
        public string Optimizer { get; set; } = string.Empty;
        public int Epoch { get; set; }
        public string Output { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public List<Encoding> Encodings { get; set; } = new List<Encoding>();
        public string ProblemType { get; set; } = string.Empty;
    }
}
