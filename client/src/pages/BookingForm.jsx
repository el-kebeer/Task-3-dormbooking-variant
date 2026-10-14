import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: when there is an `id`, load the booking and fill the form.
  useEffect(() => {
    if (!id) return

    let isMounted = true
    async function loadBooking() {
      try {
        const res = await api.get(`/bookings/${id}`)
        if (!isMounted) return
        const b = res.data.booking
        setForm({
          roomNumber: b.roomNumber || '',
          startDate: b.startDate ? b.startDate.slice(0, 10) : '',
          endDate: b.endDate ? b.endDate.slice(0, 10) : '',
          purpose: b.purpose || ''
        })
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load booking')
        }
      }
    }

    loadBooking()
    return () => { isMounted = false }
  }, [id])

  // Update `form` state when an input changes.
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // POST a new booking, or PATCH the existing one when editing,
  // then navigate to /bookings. Show the server's error message on failure.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    const payload = {
      roomNumber: form.roomNumber,
      startDate: form.startDate,
      endDate: form.endDate,
      purpose: form.purpose
    }

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, payload)
      } else {
        await api.post('/bookings', payload)
      }
      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save booking')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Booking</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <input
            className="input"
            name="roomNumber"
            placeholder="Room number"
            value={form.roomNumber}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-zinc-700">Start date</label>
          <input
            className="input"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-zinc-700">End date</label>
          <input
            className="input"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <textarea
            className="input"
            rows="3"
            name="purpose"
            placeholder="Purpose (optional)"
            value={form.purpose}
            onChange={onChange}
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
