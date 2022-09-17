using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Notifications
    {
        public int Id { get; set; }
        public string notification { get; set; }
        public string routerLink { get; set; }
        [ForeignKey("FK_USER")]
        public int UserID {get; set;}
        public virtual User user {get; set;} = new User();
    }
}