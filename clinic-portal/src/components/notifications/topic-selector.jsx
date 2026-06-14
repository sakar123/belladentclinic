import useSWR from "swr";
import { api } from "@/lib/api";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

export default function TopicSelector({ value, onChange, filterAudience }) {
  const { data: topics } = useSWR('notification-topics', () => api.notifications.topics());
  const filtered = (topics || []).filter(
    t => !filterAudience || t.audience_scope === filterAudience || t.audienceScope === filterAudience || t.audience_scope === 'Any' || t.audienceScope === 'Any'
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose topic" />
      </SelectTrigger>
      <SelectContent>
        {filtered.map(t => (
          <SelectItem key={t.code} value={t.code}>{t.name} ({t.code})</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
