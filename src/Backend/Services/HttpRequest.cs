using System.Text.Json;
using Backend.Services;

namespace Backend.Services
{
    public class HttpRequest
    {
        //private static readonly HttpClient _http = HTTP.GetHttpClient;

        public static async Task<ReturnType> SendPostRequest<ReturnType, SendType>(string url, SendType sendObject)
        {
            HttpClient _http = new HttpClient();
            
            _http.Timeout = Timeout.InfiniteTimeSpan;
            var json = JsonSerializer.Serialize(sendObject);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            var response = await _http.PostAsync(url, content);
            if (response.StatusCode != System.Net.HttpStatusCode.OK)
            {
                throw new Exception("Error fetching data from WEB SERVICE!");
            }
            //ReturnType responseData = JsonSerializer.Deserialize<ReturnType>(await response.Content.ReadAsStringAsync());
            ReturnType responseData = await response.Content.ReadFromJsonAsync<ReturnType>();
            _http.Dispose();
            content.Dispose();
            response.Dispose();
            return responseData;
        }
    }
}