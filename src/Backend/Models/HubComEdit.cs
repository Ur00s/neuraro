using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class HubComEdit
    {
        public int id {get; set;}

        public bool response {get; set;}

        public string newbody {get; set;}
    }
}