using System.IO;
using System.Threading.Tasks;

namespace ClinicApi.Services
{
    public interface IFileStorageService
    {
        Task<string> UploadAsync(string key, Stream content, string contentType);
        Task<string> GetPresignedUrlAsync(string key);
        Task DeleteAsync(string key);
    }
}
