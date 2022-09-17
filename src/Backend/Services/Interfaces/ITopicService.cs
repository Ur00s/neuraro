using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface ITopicService
    {
        Task<List<Topic>> GetAllTopics();
        Task<Topic> GetTopic(int id);
        Task<Topic> InsertTopic(Topic topic);
        Task<bool> DeleteTopic(int id);
        Task<bool> EditTopic(int id,string newBody);
        Task<List<TopicDetail>> GetComments(int id);
        Task<List<Likes>> GetLikes(int id);
        Task<TopicDetail> InsertComment(TopicDetail comment);
        Task<bool> isItLiked(int userId,int commentId);
        Task<bool> LikeDislike(int uid,int cid,bool likeOrNot);
        Task<bool> deleteCommet(int id);
        Task<bool> editComment(int id,string newComment);
        Task<Reply> replyComment(Reply reply);
        Task<List<Reply>> GetAllReplys(int Id);
        Task<bool> isItLikedReply(int userId,int ReplyId);
        Task<bool> LikeDislikeReply(int uid,int pid,bool likeOrNot);
        Task<List<ReplyLikes>> GetReplyLikes(int id);
        Task<bool> deleteReply(int id);
        Task<bool> editReply(int id,string newReply);
        Task<Reply> GetReply(int Id);
    }
}
