using System.Collections.Generic;
using System.Threading.Tasks;
using ClinicApi.Models.DTOs;

namespace ClinicApi.Services
{
    public interface IGoogleReviewsService
    {
        Task<IEnumerable<GoogleReviewDto>> GetReviewsAsync();
    }
}
