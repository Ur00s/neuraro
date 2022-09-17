using Backend.Data;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class TopicService : ITopicService
    {
        private readonly DataContext _context;

        public TopicService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<Topic>> GetAllTopics()
        {
            var topics = await _context.Topics.ToListAsync();
            if(topics == null)
            {
                throw new Exception("Error while fetching topics...");
            }
            foreach(var topic in topics)
            {
                var user = await _context.Users.FindAsync(topic.UserID);
                if(user==null)
                    throw new Exception("error!");
                //user.PasswordHash=null;
                //user.PasswordSalt=null;
                topic.user=user;
            }

            return topics;
        }

        public async Task<Topic> GetTopic(int id)
        {
            var topic = await _context.Topics.FindAsync(id);
            var user = await _context.Users.FindAsync(topic.UserID);
            topic.user=user;
            if (topic == null)
            {
                throw new Exception("Topic with this id doesn't exist");
            }

            return topic;
        }
        public async Task<Topic> InsertTopic(Topic topic)
        {
            var user = await _context.Users.FindAsync(topic.UserID);
            if(user==null)
                throw new Exception("error!");
            topic.user=user;
            await _context.AddAsync(topic);
            await _context.SaveChangesAsync();
            return topic;
        }
        public async Task<bool> DeleteTopic(int id)
        {
            Topic topic = await _context.Topics.Where(t=>t.Id==id).FirstOrDefaultAsync();
            _context.Topics.Remove(topic);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> EditTopic(int id,string newBody)
        {
            Topic topic = await _context.Topics.Where(t=>t.Id==id).FirstOrDefaultAsync();
            if(topic==null)
            {
                throw new Exception("Error fetching data");
            }
            else
            {
                topic.Description=newBody;
                _context.Topics.Update(topic);
                await _context.SaveChangesAsync();
                return true;
            }
        }
        public async Task<List<TopicDetail>> GetComments(int id)
        {
            var comments = await _context.TopicDetails.Where(t=>t.TopicID==id).ToListAsync();
            if(comments==null)
            {
                throw new Exception("Error fetching data");
            }
            
            if(comments.Count==0)
            {
                //throw new Exception("No comment on this topic");
            }
            for(var i=0;i<comments.Count;i++)
            {
                var user = await _context.Users.FindAsync(comments[i].UserID);
                //user.PasswordHash=null;
                //user.PasswordSalt=null;
                comments[i].user = user;
                var topic = await _context.Topics.FindAsync(comments[i].TopicID);
                //topic.user.PasswordHash=null;
                //topic.user.PasswordSalt=null;
                comments[i].topic=topic;

            }
            return comments;
        }
        public async Task<List<Likes>> GetLikes(int id)
        {
            var likes = await _context.Likes.Where(t=>t.commentId==id).ToListAsync();
            if(likes==null)
            {
                throw new Exception("Error fetching data");
            }
            foreach(var like in likes)
            {
                var user = await _context.Users.FindAsync(like.UserID);
                //user.PasswordHash=null;
                //user.PasswordSalt=null;
                like.user=user;
                var comment = await _context.TopicDetails.FindAsync(like.commentId);
                //comment.user.PasswordHash=null;
                //comment.user.PasswordSalt=null;
                like.comment=comment;
            }
            return likes;
        }

        public async Task<TopicDetail> InsertComment(TopicDetail comment)
        {
            var user = await _context.Users.FindAsync(comment.UserID);
            var topic = await _context.Topics.FindAsync(comment.TopicID);
            comment.user=user;
            comment.topic=topic;
            await _context.TopicDetails.AddAsync(comment);
            await _context.SaveChangesAsync();
            return comment;
        }
        public async Task<bool> isItLiked(int userId,int commentId)
        {
            var like = await _context.Likes.Where(t=>t.commentId==commentId && t.UserID==userId).ToListAsync();
            if(like==null)
            {
                throw new Exception("Error fetching data");
            }
            if(like.Count==1)
            {
                return true;
            }
            else
            {
                return false;
            }

        }
        public async Task<bool> LikeDislike(int uid,int cid,bool likeOrNot)
        {
            if(likeOrNot)
            {
                Likes temp = new Likes();
                temp.UserID=uid;
                var user = await _context.Users.FindAsync(temp.UserID);
                // user.PasswordHash=null;
                // user.PasswordSalt=null;
                temp.user=user;
                temp.commentId=cid;
                var comment = await _context.TopicDetails.FindAsync(temp.commentId);
                //comment.user.PasswordHash=null;
                //comment.user.PasswordSalt=null;
                temp.comment=comment;
                await _context.Likes.AddAsync(temp);
                await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                var temp = await _context.Likes.Where(t=>t.UserID==uid && t.commentId==cid).FirstOrDefaultAsync();
                //Likes like = new Likes();
                var like = await _context.Likes.FindAsync(temp.Id);
                _context.Likes.Remove(like);
                await _context.SaveChangesAsync();
                return false;
            }
        }

        public async Task<bool> deleteCommet(int id)
        {
            TopicDetail comment = await _context.TopicDetails.Where(t=>t.Id==id).FirstOrDefaultAsync();
            if(comment==null)
            {
                throw new Exception("Error fetching data");
            }
            else
            {
                _context.TopicDetails.Remove(comment);
                await _context.SaveChangesAsync();
                return true;
            }
            
        }
        public async Task<bool> editComment(int id,string newComment)
        {
            TopicDetail com = await _context.TopicDetails.Where(t=>t.Id==id).FirstOrDefaultAsync();
            if(com==null)
            {
                throw new Exception("Error fetching data");
            }
            else
            {
                com.comment=newComment;
                _context.TopicDetails.Update(com);
                await _context.SaveChangesAsync();
                return true;
            }
        }
        public async Task<Reply> replyComment(Reply reply)
        {
            var user = await _context.Users.FindAsync(reply.UserID);
            reply.user=user;
            var parent = await _context.TopicDetails.FindAsync(reply.ParentID);
            reply.Parent=parent;

            await _context.Reply.AddAsync(reply);
            await _context.SaveChangesAsync();
            return reply;

        }
        public async Task<List<Reply>> GetAllReplys(int Id)
        {
            var replyList = await _context.Reply.Where(t=>t.ParentID==Id).ToListAsync();
            foreach(var replay in replyList)
            {
                var user = await _context.Users.FindAsync(replay.UserID);
                //user.PasswordHash=null;
                //user.PasswordSalt=null;
                replay.user=user;
                var parent = await _context.TopicDetails.FindAsync(replay.ParentID);
                //parent.user.PasswordHash=null;
                //parent.user.PasswordSalt=null;
                //parent.topic.user.PasswordHash=null;
                //parent.topic.user.PasswordSalt=null;
                replay.Parent=parent;
            }
            return replyList;
        }

        public async Task<Reply> GetReply(int Id)
        {
            var rep = await _context.Reply.FindAsync(Id);
            return rep;
        }
        // public async Task<bool> DeleteTopic(int id)
        // {

        // }
        public async Task<bool> isItLikedReply(int userId,int ReplyId)
        {
            var like = await _context.ReplyLikes.Where(t=>t.ReplyId==ReplyId && t.UserID==userId).ToListAsync();
            if(like==null)
            {
                throw new Exception("Error fetching data");
            }
            if(like.Count==1)
            {
                return true;
            }
            else
            {
                return false;
            }

        }
        public async Task<bool> LikeDislikeReply(int uid,int pid,bool likeOrNot)
        {
            if(likeOrNot)
            {
                ReplyLikes temp = new ReplyLikes();
                temp.UserID=uid;
                var user = await _context.Users.FindAsync(temp.UserID);
                // user.PasswordHash=null;
                // user.PasswordSalt=null;
                temp.user=user;
                temp.ReplyId=pid;
                var reply = await _context.Reply.FindAsync(temp.ReplyId);
                //comment.user.PasswordHash=null;
                //comment.user.PasswordSalt=null;
                temp.reply=reply;
                await _context.ReplyLikes.AddAsync(temp);
                await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                var temp = await _context.ReplyLikes.Where(t=>t.UserID==uid && t.ReplyId==pid).FirstOrDefaultAsync();
                //Likes like = new Likes();
                var like = await _context.ReplyLikes.FindAsync(temp.Id);
                _context.ReplyLikes.Remove(like);
                await _context.SaveChangesAsync();
                return false;
            }
        }
        public async Task<List<ReplyLikes>> GetReplyLikes(int id)
        {
            var likes = await _context.ReplyLikes.Where(t=>t.ReplyId==id).ToListAsync();
            if(likes==null)
            {
                throw new Exception("Error fetching data");
            }
            foreach(var like in likes)
            {
                var user = await _context.Users.FindAsync(like.UserID);
                //user.PasswordHash=null;
                //user.PasswordSalt=null;
                like.user=user;
                var reply = await _context.Reply.FindAsync(like.ReplyId);
                //reply.user.PasswordHash=null;
                //reply.user.PasswordSalt=null;
                //reply.Parent.user.PasswordHash=null;
                //reply.Parent.user.PasswordSalt=null;
                like.reply=reply;
            }
            return likes;
        }
        public async Task<bool> deleteReply(int id)
        {
            Reply reply = await _context.Reply.Where(t=>t.Id==id).FirstOrDefaultAsync();
            if(reply==null)
            {
                throw new Exception("Error fetching data");
            }
            else
            {
                _context.Reply.Remove(reply);
                await _context.SaveChangesAsync();
                return true;
            }
            
        }
        public async Task<bool> editReply(int id,string newReply)
        {
            Reply reply = await _context.Reply.Where(t=>t.Id==id).FirstOrDefaultAsync();
            if(reply==null)
            {
                throw new Exception("Error fetching data");
            }
            else
            {
                reply.comment=newReply;
                _context.Reply.Update(reply);
                await _context.SaveChangesAsync();
                return true;
            }
        }
    }
}
