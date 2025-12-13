using System.Runtime.Serialization;
using NpgsqlTypes;

namespace ClinicApi.Models.Enumerations
{
    public enum GenderEnum
    {
        Male,
        Female,
        Other,
        [PgName("Prefer not to say")]
        [EnumMember(Value = "Prefer not to say")]
        PreferNotToSay
    }
}
