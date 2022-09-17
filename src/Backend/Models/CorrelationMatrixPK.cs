namespace Backend.Models
{
    public class CorrelationMatrixPK
    {
        public List<string> PearsonColumns { get; set; } = new List<string>();
        public List<string> KendallColumns { get; set; } = new List<string>();
        public List<List<double>> Pearson { get; set; } = new List<List<double>>();
        public List<List<double>> Kendall { get; set; } = new List<List<double>>();
    }
}
