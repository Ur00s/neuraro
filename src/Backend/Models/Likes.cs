using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Likes
    {
        public int Id { get; set; }
        [ForeignKey("FK_USER")]
        public int UserID { get; set; }
        public virtual User user {get; set;} = new User();
        [ForeignKey("FK_COMMENT")]
        public int commentId { get; set; }
        public virtual TopicDetail comment {get;set;} = new TopicDetail();
    }
}