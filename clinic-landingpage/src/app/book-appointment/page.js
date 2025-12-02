'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../lib/translations'

// Helper function to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 7; // 7 AM
  const endHour = 20; // 8 PM (20:00)

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === endHour && m > 0) continue; // Do not include 8:30 PM
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
  }
  return slots;
};

export default function BookAppointmentPage() {
  const { language } = useLanguage()
  const t = translations[language]

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    date: '',
    time: timeSlots[0] || '', // Default to the first available time slot
    message: '',
    botField: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.botField) return // spam bot

    setLoading(true)
    console.log('Submitting form:', form)
    const res = await fetch('/api/appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (res.ok) {
      toast.success(t.toastSuccess)
      setForm({
        fullName: '',
        email: '',
        phone: '',
        gender: '',
        date: '',
        time: timeSlots[0] || '', // Reset to default after submission
        message: '',
        botField: '',
      })
    } else {
      toast.error(t.toastError)
    }
  }

  return (
    <section className="realtive max-w-2xl mx-auto px-4 py-20 mt-40">
      <h1 className="text-4xl font-bold mb-6">{t.bookNow}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="botField"
          className="hidden"
          onChange={handleChange}
          value={form.botField}
          tabIndex="-1"
          autoComplete="off"
        />
        <Input
          type="text"
          name="fullName"
          placeholder={t.formFullNameLabel}
          required
          value={form.fullName}
          onChange={handleChange}
        />
        <Input
          type="email"
          name="email"
          placeholder={t.formEmailLabel }
          required
          value={form.email}
          onChange={handleChange}
        />
        <Input
          type="tel"
          name="phone"
          placeholder={t.phonePlaceholder}
          required
          value={form.phone}
          onChange={handleChange}
        />
        <Input
          type="text"
          name="gender"
          placeholder="Gender (Male/Female/Other/Prefer not to say)"
          required
          value={form.gender}
          onChange={handleChange}
        />
        <div className="flex gap-4">
          <Input
            type="date"
            name="date"
            required
            value={form.date}
            onChange={handleChange}
          />
          <select
            name="time"
            required
            value={form.time}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="" disabled>Select Time</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
        <Textarea
          name="message"
          placeholder={t.optionalMessage}
          value={form.message}
          onChange={handleChange}
        />
        <Button type="submit" disabled={loading}>
          {loading ? t.sending : t.bookAppointment}
        </Button>
      </form>
    </section>
  )
}
