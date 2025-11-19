'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../lib/translations'

export default function BookAppointmentPage() {
  const { language } = useLanguage()
  const t = translations[language]

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
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
        date: '',
        time: '',
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
        <div className="flex gap-4">
          <Input
            type="date"
            name="date"
            required
            value={form.date}
            onChange={handleChange}
          />
          <Input
            type="time"
            name="time"
            required
            value={form.time}
            onChange={handleChange}
          />
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
