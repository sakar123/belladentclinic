'use client'

import { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../lib/translations'
import ReCAPTCHA from "react-google-recaptcha";
import { getAppointments, bookAppointment } from '@/lib/api';

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
  const [captchaValue, setCaptchaValue] = useState(null);

  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    date: '',
    time: '',
    message: '',
    botField: '',
  })

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchAppointments();
  }, []);

  const availableTimeSlots = useMemo(() => {
    const allSlots = generateTimeSlots();
    if (!form.date) return allSlots;

    const bookedSlots = appointments
      .filter(appointment => appointment.date === form.date)
      .map(appointment => appointment.time);

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }, [form.date, appointments]);

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!form.fullName) newErrors.fullName = 'Full name is required.'
    if (!form.email) {
      newErrors.email = 'Email is required.'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid.'
    }
    if (!form.phone) newErrors.phone = 'Phone number is required.'
    if (!form.date) {
      newErrors.date = 'Date is required.'
    } else {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date must be in the future.'
      }
    }
    if (!form.time) newErrors.time = 'Time is required.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const regex = /^[0-9+]*$/;
      if (!regex.test(value)) {
        return;
      }
    }
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.botField) return // spam bot

    if (!validate()) {
      for (const error of Object.values(errors)) {
        toast.error(error)
      }
      return
    }

    if (process.env.NEXT_PUBLIC_FEATURE_ENABLE_RECAPTCHA === 'true' && !captchaValue) {
      toast.error("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);
    try {
      await bookAppointment(form);
      toast.success(t.toastSuccess);
      setForm({
        fullName: '',
        email: '',
        phone: '',
        gender: '',
        date: '',
        time: '',
        message: '',
        botField: '',
      });
      if (process.env.NEXT_PUBLIC_FEATURE_ENABLE_RECAPTCHA === 'true') {
        setCaptchaValue(null);
      }
    } catch (error) {
      toast.error(t.toastError);
    } finally {
      setLoading(false);
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
        <select
          name="gender"
          required
          value={form.gender}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-700 placeholder-gray-400 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-600"
        >
          <option value="" disabled>Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
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
            {availableTimeSlots.map(slot => (
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
        {process.env.NEXT_PUBLIC_FEATURE_ENABLE_RECAPTCHA === 'true' && (
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            onChange={(value) => setCaptchaValue(value)}
          />
        )}
        <Button type="submit" disabled={loading}>
          {loading ? t.formSending : t.bookAppointment}
        </Button>
      </form>
    </section>
  )
}
