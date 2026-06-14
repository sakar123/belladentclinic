using System;

namespace ClinicApi.Models.Exceptions
{
    public class IncompatibleToothStatusException : Exception
    {
        public string CurrentStatus { get; }
        public string NewStatus { get; }

        public IncompatibleToothStatusException(string currentStatus, string newStatus, string? message = null)
            : base(message ?? $"Transition from {currentStatus} to {newStatus} is incompatible.")
        {
            CurrentStatus = currentStatus;
            NewStatus = newStatus;
        }
    }
}

