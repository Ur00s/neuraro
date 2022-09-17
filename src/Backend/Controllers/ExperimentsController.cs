using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Backend.Controllers
{
    [Route("experiments")]
    [ApiController]
    [Authorize]
    public class ExperimentsController : ControllerBase
    {
        private IExperimentService _experimentService;
        private readonly IConfiguration _configuration;
        private readonly IFileService _fileService;

        public ExperimentsController(IFileService fileService, IExperimentService experimentService, IConfiguration configuration)
        {
            _experimentService = experimentService;
            _configuration = configuration;
            _fileService = fileService;
        }

        [HttpPost("create/{id}")]
        public async Task<IActionResult> CreateExperiment([FromRoute] int id, [FromBody] ExperimentDTO experiment)
        {
            try
            {
                var result = await _experimentService.CreateExperiment(id, experiment.Name, experiment.Description, experiment.FileId);
                return Ok(new { created = result });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<List<ExperimentDTO>>> GetAll(int id)
        {
            var experiments = await _experimentService.GetExperiments(id);
            List<ExperimentDTO> experimentDTOs = new List<ExperimentDTO>();
            foreach (var exp in experiments)
            {
                experimentDTOs.Add(new ExperimentDTO { Id = exp.Id, Description = exp.Description, FileId = exp.FileId, Name = exp.Name, UserId = exp.UserId});
            }
            return Ok(experimentDTOs);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _experimentService.DeleteExperiment(id);
            return Ok(new { deleted = deleted });   
        }

        [HttpGet("exp/{id}"), AllowAnonymous]
        public async Task<ActionResult<object>> GetExperiment([FromRoute] int id)
        {
            var experiment = await _experimentService.GetExperimentById(id);
            if (experiment != null && experiment.ModelPath != string.Empty)
            {
                using (StreamReader streamReader = new StreamReader(experiment.HyperparametersPath))
                {
                    string json = streamReader.ReadToEnd();
                    var neuralNetwork = JsonSerializer.Deserialize<NeuralNetwork>(json);
                    return Ok(new { 
                        experimet = experiment.Name, 
                        description = experiment.Description,
                        inputs = neuralNetwork.Inputs,
                        output = neuralNetwork.Output
                    });
                }
            }
            return NotFound();
        }

        [HttpPost("predict"), AllowAnonymous]
        public async Task<ActionResult<object>> MakePrediction([FromBody] Predict predict)
        {
            var experiment = await _experimentService.GetExperimentById(predict.ExperimentId);
            if (experiment != null)
            {
                experiment.File = await _fileService.GetFile(experiment.FileId);
                using (StreamReader streamReader = new StreamReader(experiment.HyperparametersPath))
                {
                    string json = streamReader.ReadToEnd();
                    var neuralNetwork = JsonSerializer.Deserialize<NeuralNetwork>(json);
                    var data = new
                    {
                        Model = experiment.ModelPath,
                        Values = predict.Values,
                        Inputs = neuralNetwork.Inputs,
                        Output = neuralNetwork.Output,
                        ProblemType = neuralNetwork.ProblemType,
                        FilePath = experiment.File.FilePath
                    };

                    var response = await Services.HttpRequest.SendPostRequest<object, object>(_configuration.GetSection("WebService:flask").Value + "predict", data); ;

                    return Ok(response);
                }
            }
            return BadRequest();
        }
    }
}
