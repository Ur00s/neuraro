using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Topic
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime CreationDate { get; set; }
        public string Description { get; set; }
        [ForeignKey("FK_USER")]
        public int UserID {get; set;}
        public virtual User user {get; set;} = new User();
    }
}