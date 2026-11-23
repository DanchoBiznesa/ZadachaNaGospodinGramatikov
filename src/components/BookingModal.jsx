import { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import { useStore } from '../store.jsx'
import { BG_DAYS, fmtTime, isPast, isWorkingDay, nextDays, slotKey, slotsFor } from '../lib/booking.js'

export default function BookingModal({ business, editing, onClose, onDone }) {
  const { index, book } = useStore()
  const days = useMemo(() => nextDays(14), [])
  const times = useMemo(() => slotsFor(business), [business])

  const firstOpen = days.find((d) => isWorkingDay(business, d.date))
  const [date, setDate] = useState(editing?.date || firstOpen?.iso)
  const [resourceId, setResourceId] = useState(editing?.resourceId || business.resources[0].id)
  const [start, setStart] = useState(editing?.start ?? null)
  const [error, setError] = useState('')

  const resource = business.resources.find((r) => r.id === resourceId)

  // Статус на всеки слот – пресмята се само при смяна на ден/ресурс/резервации
  const slots = useMemo(() => times.map((t) => {
    const used = index.get(slotKey(business.id, resourceId, date, t)) || 0
    const own = editing && editing.resourceId === resourceId && editing.date === date && editing.start === t ? 1 : 0
    const free = resource.capacity - (used - own)
    return { t, free, disabled: free <= 0 || isPast(date, t) }
  }), [times, index, business.id, resourceId, date, resource.capacity, editing])

  const confirm = () => {
    const res = book({ businessId: business.id, resourceId, date, start }, editing?.id)
    if (res.error) return setError(res.error)
    onDone(editing ? 'Резервацията е променена.' : 'Резервацията е потвърдена.')
    onClose()
  }

  return (
    <Modal title="Резервация" onClose={onClose}>
      <h2>{editing ? 'Промяна на резервация' : 'Нова резервация'}</h2>
      <p className="muted">{business.name} · {business.address}</p>

      <h3>1. Изберете ден</h3>
      <div className="days">
        {days.map(({ iso, date: d }) => {
          const ok = isWorkingDay(business, d)
          return (
            <button key={iso} disabled={!ok} className={'day' + (iso === date ? ' on' : '')}
              onClick={() => { setDate(iso); setStart(null); setError('') }}>
              <span>{BG_DAYS[d.getDay()]}</span><b>{d.getDate()}</b>
            </button>
          )
        })}
      </div>

      <h3>2. {business.resourceLabel}</h3>
      <div className="chips">
        {business.resources.map((r) => (
          <button key={r.id} className={'chip' + (r.id === resourceId ? ' on' : '')}
            onClick={() => { setResourceId(r.id); setStart(null); setError('') }}>{r.name}</button>
        ))}
      </div>

      <h3>3. Изберете час</h3>
      <div className="slots">
        {slots.map(({ t, free, disabled }) => (
          <button key={t} disabled={disabled} className={'slot' + (t === start ? ' on' : '')}
            onClick={() => { setStart(t); setError('') }}>
            {fmtTime(t)}
            {resource.capacity > 1 && !disabled && <small>{free} св.</small>}
          </button>
        ))}
      </div>

      {error && <div className="error" role="alert">{error}</div>}
      <button className="btn primary wide" disabled={start === null} onClick={confirm}>
        {start === null ? 'Изберете час' : `${editing ? 'Запази промяната' : 'Потвърди'} · ${date.split('-').reverse().join('.')} в ${fmtTime(start)}`}
      </button>
    </Modal>
  )
}
