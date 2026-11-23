
import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState
} from 'react'

import { BUSINESSES } from './data/businesses.js'
import { useStore } from './store.jsx'

import Header from './components/Header.jsx'
import AuthModal from './components/AuthModal.jsx'
import BookingModal from './components/BookingModal.jsx'

import {
  BusinessCard,
  MyBookings,
  Profile
} from './components/Views.jsx'


export default function App() {

  // Данни за потребителя
  const { user } = useStore()


  // Състояние на страницата
  const [view, setView] = useState('home')
  const [query, setQuery] = useState('')


  // Състояние на модалните прозорци
  const [auth, setAuth] = useState(null)
  const [booking, setBooking] = useState(null)


  // Съобщения
  const [toast, setToast] = useState('')


  // Оптимизация на търсенето
  const deferred = useDeferredValue(query)


  // Филтриране на бизнесите
  const filtered = useMemo(() => {
    const search = deferred.trim().toLowerCase()

    if (!search) {
      return BUSINESSES
    }

    return BUSINESSES.filter((business) => {
      const info = `
        ${business.name}
        ${business.type}
        ${business.address}
        ${business.description}
      `.toLowerCase()

      return info.includes(search)
    })

  }, [deferred])


  // Отваряне на резервация
  const reserve = useCallback((business, editing = null) => {

    // Ако потребителят е влязъл
    if (user) {
      setBooking({ business, editing })
      return
    }

    // Ако не е влязъл
    setAuth({
      reason: 'Влезте или се регистрирайте, за да резервирате.',

      after: () => {
        setBooking({ business, editing })
      }
    })

  }, [user])


  // Показване на съобщение
  const done = (message) => {
    setToast(message)

    setTimeout(() => {
      setToast('')
    }, 2800)
  }


  // Отваряне на входа
  const openLogin = () => {
    setAuth({})
  }


  return (
    <>

      {/* Горна навигация */}
      <Header
        onNavigate={setView}
        onLogin={openLogin}
      />


      {/* Основно съдържание */}
      <main>

        {/* Начална страница */}
        {view === 'home' && (
          <>

            <section className="hero">

              <h1>Запишете си час за минута</h1>

              <p>
                Бръснарница, зъболекар или маса в ресторант –
                на едно място.
              </p>

              {/* Търсачка */}
              <div className="search">

                <span aria-hidden>🔍</span>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Търсете бизнес, вид или адрес…"
                  aria-label="Търсене на бизнеси"
                />

              </div>

            </section>


            {/* Списък с бизнеси */}
            <section className="grid">

              {filtered.map((business) => (
                <BusinessCard
                  key={business.id}
                  b={business}
                  onReserve={reserve}
                />
              ))}


              {/* Ако няма резултати */}
              {filtered.length === 0 && (
                <p className="muted center">
                  Няма намерени бизнеси за „{query}“.
                </p>
              )}

            </section>

          </>
        )}


        {/* Профил */}
        {view === 'profile' && (
          <Profile
            onLogin={openLogin}
            onNavigate={setView}
          />
        )}


        {/* Моите резервации */}
        {view === 'bookings' && (
          <MyBookings
            onLogin={openLogin}
            onEdit={reserve}
            onNavigate={setView}
          />
        )}

      </main>


      {/* Прозорец за вход и регистрация */}
      {auth && (
        <AuthModal
          reason={auth.reason}
          onClose={() => setAuth(null)}
          onSuccess={auth.after}
        />
      )}


      {/* Прозорец за резервация */}
      {booking && (
        <BookingModal
          business={booking.business}
          editing={booking.editing}
          onClose={() => setBooking(null)}
          onDone={done}
        />
      )}


      {/* Известия */}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

    </>
  )
}
