using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Reply
    {
        public int Id { get; set; }
        public string comment { get; set; }
        [ForeignKey("FK_TOPIC")]
        public int ParentID { get; set; }
        public virtual TopicDetail Parent {get;set;} = new TopicDetail();
        [ForeignKey("FK_USER")]
        public int UserID { get; set; }
        public virtual User user {get; set;} = new User();
    }
}