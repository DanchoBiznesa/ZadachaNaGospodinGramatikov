import { memo } from 'react'
import { BUSINESS_MAP } from '../data/businesses.js'
import { fmtTime, isPast } from '../lib/booking.js'
import { useStore } from '../store.jsx'

// memo: картата не се рендерира наново при писане в търсачката за други карти
export const BusinessCard = memo(function BusinessCard({ b, onReserve }) {
  return (
    <article className="card">
      <div className="banner" style={{ background: `linear-gradient(135deg, ${b.colors[0]}, ${b.colors[1]})` }}>
  {b.image
    ? <img className="banner-img" src={b.image} alt={b.name} />
    : <span className="emoji">{b.emoji}</span>}
  <span className="tag">{b.type}</span>
</div>
      <div className="card-body">
        <h3>{b.name}</h3>
        <p className="addr">📍 {b.address}</p>
        <p className="muted">{b.description}</p>
        <p className="meta">🕒 {b.open}:00 – {b.close}:00</p>
        <button className="btn primary wide" onClick={() => onReserve(b)}>Резервирай</button>
      </div>
    </article>
  )
})

export function Profile({ onLogin, onNavigate }) {
  const { user, myBookings, logout } = useStore()
  if (!user) return <Gate text="Влезте, за да видите профила си." onLogin={onLogin} />
  return (
    <section className="panel">
      <div className="avatar big">{user.name[0].toUpperCase()}</div>
      <h2>{user.name}</h2>
      <p className="muted">{user.phone}</p>
      <p>Активни резервации: <b>{myBookings.filter((b) => !isPast(b.date, b.start)).length}</b></p>
      <div className="row">
        <button className="btn primary" onClick={() => onNavigate('bookings')}>Моите резервации</button>
        <button className="btn ghost" onClick={() => { logout(); onNavigate('home') }}>Изход</button>
      </div>
    </section>
  )
}

export function MyBookings({ onLogin, onEdit, onNavigate }) {
  const { user, myBookings, cancel } = useStore()
  if (!user) return <Gate text="Влезте, за да видите резервациите си." onLogin={onLogin} />
  return (
    <section className="panel wide-panel">
      <h2>Моите резервации</h2>
      {myBookings.length === 0 && (
        <div className="empty">
          <p>Още нямате резервации.</p>
          <button className="btn primary" onClick={() => onNavigate('home')}>Разгледай бизнесите</button>
        </div>
      )}
      <ul className="list">
        {myBookings.map((bk) => {
          const b = BUSINESS_MAP[bk.businessId]
          const r = b.resources.find((x) => x.id === bk.resourceId)
          const past = isPast(bk.date, bk.start)
          return (
            <li key={bk.id} className={past ? 'past' : ''}>
              <div className="when">
                <b>{bk.date.split('-').reverse().join('.')}</b>
                <span>{fmtTime(bk.start)}</span>
              </div>
              <div className="what">
                <b>{b.name}</b>
                <span className="muted">{b.resourceLabel}: {r.name}</span>
              </div>
              {past
                ? <span className="badge">Приключила</span>
                : <div className="row">
                    <button className="btn ghost sm" onClick={() => onEdit(b, bk)}>Промени</button>
                    <button className="btn danger sm" onClick={() => cancel(bk.id)}>Откажи</button>
                  </div>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

const Gate = ({ text, onLogin }) => (
  <section className="panel">
    <h2>Нужен е вход</h2>
    <p className="muted">{text}</p>
    <button className="btn primary" onClick={onLogin}>Вход / Регистрация</button>
  </section>
)
