using Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http;
using System.Text.Json;
using System.Net.WebSockets;
using Microsoft.AspNetCore.SignalR;
using Backend.SignalR;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [Route("ann")]
    [ApiController]
    [Authorize]
    public class NeuralNetworkController : ControllerBase
    {
        private IConfiguration _configuration;
        private IHubContext<ChartHub> _chartHub;
        private IExperimentService _experimentService;
        private IUsersService _userService;

        private static string Folder = "Resources";
        private static string FolderForExperiments = "Experiments";

        public NeuralNetworkController(IConfiguration configuration, IHubContext<ChartHub> chartHub, IExperimentService experimentService, IUsersService userService)
        {
            _configuration = configuration;
            _chartHub = chartHub;
            _experimentService = experimentService;
            _userService = userService;
        }

        [HttpPost]
        public async Task<IActionResult> Post(NeuralNetwork network)
        {
            return Ok(await Services.HttpRequest.SendPostRequest<NeuralNetworkModelTraining, NeuralNetwork>(_configuration.GetSection("WebService:Url").Value + "ann", network));
        }

        [HttpPost("model/{connID}/{expId}/{userId}")]
        public async Task<IActionResult> TrainModel(string connID, int expId, int userId, [FromBody] NeuralNetwork network)
        {
            var experiment = await _experimentService.GetExperimentById(expId);
            var folderName = Path.Combine(Folder, FolderForExperiments, userId.ToString());
            Directory.CreateDirectory(folderName);
            var fileToSave = "model_" + experiment.Name + ".h5";
            var modelPath = Path.Combine(Directory.GetCurrentDirectory(), folderName, fileToSave);
            var savePath = Path.Combine(Directory.GetCurrentDirectory(), folderName, "");
            var hiperParametarPath = Path.Combine(Directory.GetCurrentDirectory(), folderName, experiment.Name + ".json");
            //System.IO.File.Create(modelPath);
            //var dbPath = Path.Combine(Folder, fileToSave);


            if (System.IO.File.Exists(modelPath))
            {
                System.IO.File.Delete(modelPath);
            }
            if (System.IO.File.Exists(hiperParametarPath))
            {
                System.IO.File.Delete(hiperParametarPath);
            }

            experiment.ModelPath = modelPath;
            experiment.HyperparametersPath = hiperParametarPath;
            _experimentService.UpdateExperiment(experiment);
            string jsonString = JsonSerializer.Serialize(network);
            System.IO.File.WriteAllText(hiperParametarPath, jsonString);
            string json = JsonSerializer.Serialize(new {SavePath = modelPath, FileName = experiment.Name,  NeuralNetwork = network });
            NeuralNetworkModelTraining trainProgress = new NeuralNetworkModelTraining();
            ClientWebSocket socket = new ClientWebSocket();
            string url = _configuration.GetSection("WebService:SocketUrl").Value;
            await socket.ConnectAsync(new Uri(url), CancellationToken.None);

            byte[] messageBytes = System.Text.Encoding.UTF8.GetBytes(json);
            await socket.SendAsync(new ArraySegment<byte>(messageBytes), WebSocketMessageType.Text, true, CancellationToken.None);
            byte[] incomingData = new byte[1024];
            for (int i = 0; i < network.Epoch; i++)
            {
                WebSocketReceiveResult result = await socket.ReceiveAsync(new ArraySegment<byte>(incomingData), CancellationToken.None);
                var data = System.Text.Encoding.UTF8.GetString(incomingData, 0, result.Count).Split(" ");
                var tryLoss = double.TryParse(data[0], out double loss);
                var tryValLoss = double.TryParse(data[1], out double valLoss);
                var tryMeanSqauredError = double.TryParse(data[2], out double meanSqauredError);
                var tryValMeanSqauerdError = double.TryParse(data[3], out double valMeanSqauerdError);


                trainProgress.Loss.Add(loss);
                trainProgress.ValLoss.Add(valLoss);
                trainProgress.MeanSqauredError.Add(meanSqauredError);
                trainProgress.ValMeanSqauerdError.Add(valMeanSqauerdError);
                trainProgress.Epochs.Add(i+1);

                await _chartHub.Clients.Client(connID).SendAsync("chart", trainProgress);
            }

            await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
            return Ok(trainProgress);
        }
    }
}
