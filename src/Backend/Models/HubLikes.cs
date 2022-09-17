using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class HubLikes
    {
        public int id {get; set;}

        public bool response {get; set;}

        public bool LikeOrDislike {get; set;}
    }
}