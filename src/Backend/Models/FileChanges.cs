namespace Backend.Models
{
    public class FileChanges
    {
        public int FileID { get; set; }
        public object Changes { get; set; }
        public int IndexI { get; set; }
        public int IndexJ { get; set; }
    }
}
