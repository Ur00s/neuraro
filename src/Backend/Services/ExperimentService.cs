using Backend.Data;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class ExperimentService : IExperimentService
    {
        private DataContext _context;
        private IFileService _fileService;

        public ExperimentService(DataContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        public async Task<int> CreateExperiment(int userId, string name, string description, int fileId)
        {
            SavedFile savedFile = await _fileService.GetFile(fileId);
            Experiment experiment = new Experiment {UserId = userId, Name = name, Description = description, FileId = fileId, File = savedFile };

            await _context.Experiments.AddAsync(experiment);
            await _context.SaveChangesAsync();

            return experiment.Id;
        }

        public async Task<bool> DeleteExperiment(int expId)
        {
            Experiment? experiment = await _context.Experiments.FindAsync(expId);
            if (File.Exists(experiment.ModelPath))
            {
                File.Delete(experiment.ModelPath);
            }
            if (File.Exists(experiment.HyperparametersPath))
            {
                File.Delete(experiment.HyperparametersPath);
            }
            _context.Experiments.Remove(experiment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Experiment> GetExperimentById(int id)
        {
            var experiment = await _context.Experiments.FindAsync(id);
            if (experiment == null)
            {
                throw new Exception("Experiment with this id doesn't exist!");
            }

            return experiment;
        }

        public async Task<List<Experiment>> GetExperiments(int id)
        {
            var experiments = await _context.Experiments.Where(exp => exp.UserId == id).ToListAsync();
            return experiments;
        }

        public void UpdateExperiment(Experiment experiment)
        {
            _context.Experiments.Update(experiment);
            _context.SaveChanges();
        }
    }
}
