import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

export const TOPICS = [
  { code: 'APPOINTMENT_CONFIRMATION', label: 'Appointment Confirmation', audience: 'Patient' },
  { code: 'APPOINTMENT_UPDATED', label: 'Appointment Updated', audience: 'Patient' },
  { code: 'APPOINTMENT_CANCELLED', label: 'Appointment Cancelled', audience: 'Patient' },
  { code: 'APPOINTMENT_REMINDER', label: 'Appointment Reminder', audience: 'Patient' },
  { code: 'MARKETING_PROMOTION', label: 'Marketing Promotion', audience: 'Patient' },
  { code: 'MARKETING_COUPON', label: 'Marketing Coupon', audience: 'Patient' },
  { code: 'BIRTHDAY_GREETING', label: 'Birthday Greeting', audience: 'Any' },
  { code: 'RECALL_CAMPAIGN', label: 'Recall Campaign', audience: 'Patient' },
  { code: 'STAFF_ALERT', label: 'Staff Alert', audience: 'Staff' },
  { code: 'SYSTEM_NOTICE', label: 'System Notice', audience: 'Any' },
];

export default function TopicSelector({ value, onChange, filterAudience }) {
  const topics = TOPICS.filter(t => !filterAudience || t.audience === filterAudience || t.audience === 'Any');
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose topic" />
      </SelectTrigger>
      <SelectContent>
        {topics.map(t => (
          <SelectItem key={t.code} value={t.code}>{t.label} ({t.code})</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
