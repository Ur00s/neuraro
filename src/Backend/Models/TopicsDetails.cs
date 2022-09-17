using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class TopicDetail
    {
        public int Id { get; set; }
        public string comment { get; set; }
        [ForeignKey("FK_TOPIC")]
        public int TopicID { get; set; }
        public virtual Topic topic {get;set;} = new Topic();
        [ForeignKey("FK_USER")]
        public int UserID { get; set; }
        public virtual User user {get; set;} = new User();
    }
}