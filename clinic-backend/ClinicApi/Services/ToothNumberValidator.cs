namespace ClinicApi.Services
{
    public static class ToothNumberValidator
    {
        public const string SupportedRanges = "Universal permanent 1-32, FDI permanent 11-48, or FDI primary 51-85";

        public static bool IsValid(int toothNumber)
        {
            return IsUniversalPermanent(toothNumber)
                || IsPermanentFdi(toothNumber)
                || IsPrimaryFdi(toothNumber);
        }

        public static string ValidationMessage(int toothNumber)
        {
            return $"Unsupported tooth_number {toothNumber}. Expected {SupportedRanges}.";
        }

        private static bool IsUniversalPermanent(int toothNumber)
        {
            return toothNumber >= 1 && toothNumber <= 32;
        }

        private static bool IsPermanentFdi(int toothNumber)
        {
            var quadrant = toothNumber / 10;
            var position = toothNumber % 10;
            return quadrant >= 1 && quadrant <= 4 && position >= 1 && position <= 8;
        }

        private static bool IsPrimaryFdi(int toothNumber)
        {
            var quadrant = toothNumber / 10;
            var position = toothNumber % 10;
            return quadrant >= 5 && quadrant <= 8 && position >= 1 && position <= 5;
        }
    }
}
