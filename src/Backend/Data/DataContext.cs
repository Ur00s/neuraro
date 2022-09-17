using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
namespace Backend.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base (options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<UserPass> UserPass { get; set; }
        public DbSet<Topic> Topics { get; set; }
        public DbSet<TopicDetail> TopicDetails { get; set; }
        public DbSet<Likes> Likes { get; set; }
        public DbSet<SavedFile> Files { get; set; }
        public DbSet<Reply> Reply {get; set;}
        public DbSet<ReplyLikes> ReplyLikes { get; set; }
        public DbSet<Notifications> Notifications { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Experiment> Experiments { get; set; }
    }
}