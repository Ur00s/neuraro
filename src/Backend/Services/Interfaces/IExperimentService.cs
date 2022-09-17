using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface IExperimentService
    {
        Task<int> CreateExperiment(int userId, string name, string description, int fileId);
        Task<Experiment> GetExperimentById(int id);
        void UpdateExperiment(Experiment experiment);
        Task<List<Experiment>> GetExperiments(int id);
        Task<bool> DeleteExperiment(int expId);
    }
}
