import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.jsx'

export default function Header({ onNavigate, onLogin }) {
  const { user, logout } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = (view) => { setOpen(false); onNavigate(view) }

  return (
    <header className="header">
      <div className="menu-wrap" ref={ref}>
        <button className="burger" aria-label="Меню" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <i /><i /><i />
        </button>
        {open && (
          <nav className="dropdown">
            <button onClick={() => go('home')}>Начало</button>
            <button onClick={() => go('profile')}>Профил</button>
            <button onClick={() => go('bookings')}>Моите резервации</button>
            {user && <button className="danger" onClick={() => { setOpen(false); logout(); onNavigate('home') }}>Изход</button>}
          </nav>
        )}
      </div>

      <button className="brand" onClick={() => onNavigate('home')}>
         Dancho&Didaka Booking
      </button>

      {user
        ? <button className="btn ghost user-chip" onClick={() => onNavigate('profile')}>
            <span className="avatar">{user.name[0].toUpperCase()}</span>{user.name.split(' ')[0]}
          </button>
        : <button className="btn primary" onClick={onLogin}>Вход</button>}
    </header>
  )
}
