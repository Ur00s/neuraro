using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class ReplyLikes
    {
        public int Id { get; set; }
        [ForeignKey("FK_USER")]
        public int UserID { get; set; }
        public virtual User user {get; set;} = new User();
        [ForeignKey("FK_Reply")]
        public int ReplyId { get; set; }
        public virtual Reply reply {get;set;} = new Reply();
    }
}