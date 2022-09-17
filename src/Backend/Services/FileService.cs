using Backend.Models;
using Backend.Services.Interfaces;
using System.Net.Http;
using System.Data;
using Backend.Data;

using Microsoft.EntityFrameworkCore;
using CsvHelper;
using System.Globalization;

namespace Backend.Services
{
    public class FileService : IFileService
    {
        private static string Folder = "Resources";
        private static string FolderForFiles = "Files";
        private static string FolderForImages = "Images";
        private DataContext _context;
        private readonly IConfiguration _configuration;

        public FileService(DataContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<List<SavedFile>> GetFiles(int userId)
        {
            List<SavedFile> files = await _context.Files.Where(file => file.UserID == userId).ToListAsync();

            if (files == null)
            {
                throw new Exception("Files: Error");
            }

            foreach (SavedFile file in files)
            {
                var user = await _context.Users.FindAsync(file.UserID);

                if (user == null)
                {
                    throw new Exception("Files: USER ERROR");
                }

                //user.PasswordHash = null;
                //user.PasswordSalt = null;

                file.User = user;
            }

            return files;
        }

        public async Task<string> SaveFile(IFormFile file, int id)
        {
            if (!file.FileName.ToLower().EndsWith(".csv"))
            {
                throw new Exception("File must be a CSV!");
            }

            var folderName = Path.Combine(Folder, FolderForFiles, id.ToString());

            
            var fileName = file.FileName.Replace(" ", "-");
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), folderName, fileName);
            var dbPath = Path.Combine(folderName, fileName);

            bool fileExist = File.Exists(filePath);
            if (fileExist)
            {
                throw new Exception("File exists!");
            }

            

            if (file.Length > 0)
            {
                Directory.CreateDirectory(folderName);
                
                using (Stream fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
                {
                    await file.CopyToAsync(fileStream);
                }

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    throw new Exception("User error!");
                }

                await _context.Files.AddAsync(new SavedFile { FileName = file.FileName, FilePath = filePath, Path = dbPath.Replace("\\", "/"), UserID = id, Id = 0 });
                _context.SaveChanges();

                return dbPath;
            }

            return string.Empty;
        }

        public async Task<SavedFile> GetFile(int fileID)
        {
            var file = await _context.Files.FindAsync(fileID);
            if (file == null)
            {
                throw new Exception("File doesn't exist!");
            }

            return file;
        }

        public async Task<bool> DeleteFile(int fileId)
        {
            var file = await _context.Files.FindAsync(fileId);

            if (file == null)
            {
                throw new Exception("File doesn't exist");
            }

            if (File.Exists(file.FilePath))
            {
                File.Delete(file.FilePath);
                _context.Files.Remove(file);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<List<List<object>>> LoadFile(int fileId, int from, int to)
        {

            List<List<object>> rows = new List<List<object>>();
            var file = await _context.Files.FindAsync(fileId);
            if (file == null)
            {
                throw new Exception("Error loading file!");
            }

            if (from > to)
            {
                throw new Exception("Error loading file!");
            }



            var FilePath = file.FilePath;
            var From = from;
            var To = to;

            rows = await HttpRequest.SendPostRequest<List<List<object>>, object>(_configuration.GetSection("WebService:Url").Value + "file/load", new { FilePath = FilePath, From = From, To = To });


            //using (var reader = new StreamReader(filePath))
            //using (var csvReader = new CsvReader(reader, CultureInfo.InvariantCulture))
            //{
            //    int i = 0;
            //    csvReader.Read();
            //    csvReader.ReadHeader();
            //    while (csvReader.Read())
            //    {
            //        if (i > to)
            //            return rows;

            //        if (i >= from && i <= to)
            //        {
            //            List<object> row = new List<object>();
            //            var values = csvReader.GetRecord<dynamic>();
            //            foreach (var value in values)
            //            {
            //                string temp = value.ToString();
            //                var tempArray = temp.Split(',');
                            
            //                row.Add(tempArray[1].TrimEnd(']'));
            //            }
                           
            //            rows.Add(row);
            //        }

            //        i++;
            //    }
            //}

            //using (FileStream fs = File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            //using (BufferedStream bs = new BufferedStream(fs))
            //using (var stream = new StreamReader(bs))
            //{
            //    int i = 0;
            //    string line = stream.ReadLine();
            //    while (line != null)
            //    {
            //        if (i > to)
            //            return rows;

            //        if (i >= from && i <= to)
            //        {
            //            List<object> row = new List<object>();
            //            var values = line.Split(",");
            //            foreach (var value in values)
            //                row.Add(value);
            //            rows.Add(row);
            //        }

            //        i++;
            //        line = stream.ReadLine();
            //    }
            //}



            return rows;
        }

        public async Task<bool> EditFile(int fileId, int i, int j, object toChange)
        {
            var file = await _context.Files.FindAsync(fileId);
            if (file == null)
            {
                throw new Exception("Error loading file!");
            }

            var filePath = file.FilePath;

            var response = await HttpRequest.SendPostRequest<bool, object>(_configuration.GetSection("WebService:Url").Value + "file/edit", new { IndexI = i, IndexJ = j, Changes = toChange, FilePath = filePath });

            return response;
            //int current = 0;
            //string[] headerRow;
            //using (var reader = new StreamReader(filePath))
            //using (var csvReader = new CsvReader(reader, CultureInfo.InvariantCulture))
            //{
                
            //    csvReader.Read();
            //    csvReader.ReadHeader();
            //    headerRow = csvReader.HeaderRecord;
            //    while (csvReader.Read())
            //    {
            //        List<object> row = new List<object>();
            //        var values = csvReader.GetRecord<dynamic>();
            //        if (current == i)
            //        {
            //            int k = 0;
            //            foreach (var value in values)
            //            {
            //                string temp = value.ToString();
            //                var tempArray = temp.Split(',');

            //                if (k == j)
            //                    row.Add(toChange);
            //                else
            //                    row.Add(tempArray[1].TrimEnd(']'));
            //                k++;
            //            }
            //        }
            //        else
            //        {
            //            foreach (var value in values)
            //            {
            //                string temp = value.ToString();
            //                var tempArray = temp.Split(',');

            //                row.Add(tempArray[1].TrimEnd(']'));
            //            }
            //        }
            //        rows.Add(row);
            //        current++;
            //    }
            //}

            
            //using (var writer = new StreamWriter(filePath))
            //{
            //    string header = "";
            //    foreach (var str in headerRow)
            //        header += str + ",";

            //    header.Trim();
            //    header = header.Remove(header.Length - 1, 1);
            //    writer.WriteLine(header);
            //    foreach (var row in rows)
            //    {
            //        string line = "";
            //        foreach (var cell in row)
            //        {
            //            line += cell.ToString() + ",";
            //        }
                       
                    
            //        line.Trim(' ');
            //        line = line.Remove(line.Length - 1, 1);
            //        writer.WriteLine(line);
            //    }
            //}

            return true;
        }

        public async Task<string> SaveImage(IFormFile file, int userID)
        {
            var folderName = Path.Combine(Folder, FolderForImages, userID.ToString());

            var fileName = file.FileName;
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), folderName, fileName);
            var dbPath = Path.Combine(folderName, fileName);

            bool fileExist = File.Exists(filePath);
            if (fileExist)
            {
                var image = await _context.Images.Where(img => img.FullPath == filePath).FirstOrDefaultAsync();
                File.Delete(filePath);
                _context.Images.Remove(image);
            }

            var userImg = await _context.Images.Where(img => img.UserId == userID).FirstOrDefaultAsync();
            
            if (userImg != null)
            {
                File.Delete(userImg.FullPath);
                _context.Images.Remove(userImg);
            }

            if (file.Length > 0)
            {
                Directory.CreateDirectory(folderName);

                using (Stream fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write))
                {
                    await file.CopyToAsync(fileStream);
                }

                var user = await _context.Users.FindAsync(userID);
                if (user == null)
                {
                    throw new Exception("User error!");
                }

                await _context.Images.AddAsync(new Image { Id = 0, UserId = userID, User = user, FullPath = filePath, Path = dbPath.Replace("\\", "/") });
                _context.SaveChanges();

                return dbPath;
            }

            return string.Empty;
        }

        public string GetUserImage(int userId)
        {
            var user = _context.Users.Find(userId);
            if (user == null)
            {
                throw new Exception("User doesn't exist!");
            }

            var image =  _context.Images.Where(img => img.UserId == userId).FirstOrDefault();

            if (image == null)
            {
                return "false";
            }
            else
            {
                return _configuration.GetSection("AppSettings:URL").Value + image.Path;
            }

            
        }
        public string GetGoogleImage(int userId)
        {
            var user= _context.Users.Find(userId);
            if (user == null)
            {
                throw new Exception("User doesn't exist!");
            }

            var image =  _context.Images.Where(img => img.UserId == userId).FirstOrDefault();

            return image.FullPath;

        }
        public async Task<string> SaveGoogleImage(int userId,string ImageUrl)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new Exception("User error!");
            }

            await _context.Images.AddAsync(new Image{ Id=0, UserId = userId,User=user,FullPath=ImageUrl,Path=null});
            await _context.SaveChangesAsync();

            return ImageUrl;
        }
    }
}
