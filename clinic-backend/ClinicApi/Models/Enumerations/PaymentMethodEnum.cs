using System.Runtime.Serialization;
using NpgsqlTypes;

namespace ClinicApi.Models.Enumerations
{
    public enum PaymentMethodEnum
    {
        Cash,

    [PgName("Credit Card")]
    [EnumMember(Value = "Credit Card")]
    CreditCard,

    Insurance,

    [PgName("Bank Transfer")]
    [EnumMember(Value = "Bank Transfer")]
    BankTransfer,

    [PgName("Mobile-Pay")]
    [EnumMember(Value = "Mobile-Pay")]
    MobilePay
    }
}
