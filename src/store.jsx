
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { BUSINESS_MAP } from './data/businesses.js'

import {
  buildIndex,
  isPast,
  isWorkingDay,
  slotKey,
  slotsFor,
  validPhone
} from './lib/booking.js'


// СЪЗДАВАНЕ НА CONTEXT

const Ctx = createContext(null)

export const useStore = () => useContext(Ctx)


// ЗАРЕЖДАНЕ И ЗАПАЗВАНЕ НА ДАННИ

// Зареждане на данни от localStorage
const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

// Запазване на данни в localStorage
const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

// STORE PROVIDER

export function StoreProvider({ children }) {

  // Основни данни
  const [users, setUsers] = useState(() => load('zp_users', []))

  const [session, setSession] = useState(
    () => load('zp_session', null)
  )

  const [bookings, setBookings] = useState(
    () => load('zp_bookings', [])
  )


  // АВТОМАТИЧНО ЗАПАЗВАНЕ

  useEffect(() => {
    save('zp_users', users)
  }, [users])

  useEffect(() => {
    save('zp_session', session)
  }, [session])

  useEffect(() => {
    save('zp_bookings', bookings)
  }, [bookings])


  // ПОТРЕБИТЕЛСКА ИНФОРМАЦИЯ

  // Текущ влязъл потребител
  const user = useMemo(
    () => users.find((u) => u.phone === session) || null,
    [users, session]
  )


  // Индекс на всички резервации
  const index = useMemo(
    () => buildIndex(bookings),
    [bookings]
  )


  // Резервации на текущия потребител
  const myBookings = useMemo(
    () => {
      return bookings
        .filter((b) => b.userPhone === session)
        .sort((a, b) => {
          const first = a.date + String(a.start).padStart(4, '0')
          const second = b.date + String(b.start).padStart(4, '0')

          return first.localeCompare(second)
        })
    },
    [bookings, session]
  )


  // РЕГИСТРАЦИЯ

  const register = useCallback(({ name, phone, password }) => {

    // Проверка на името
    if (name.trim().length < 2) {
      return {
        error: 'Въведете име (поне 2 букви).'
      }
    }


    // Проверка на телефонния номер
    if (!validPhone(phone)) {
      return {
        error: 'Номерът трябва да започва с 08 и да е точно 10 цифри.'
      }
    }


    // Проверка на паролата
    if (password.length < 6) {
      return {
        error: 'Паролата трябва да е поне 6 символа.'
      }
    }


    // Проверка за съществуващ профил
    if (users.some((u) => u.phone === phone)) {
      return {
        error: 'Вече има профил с този номер. Влезте в него.'
      }
    }


    // Създаване на нов потребител
    setUsers((u) => [
      ...u,
      {
        name: name.trim(),
        phone,
        password
      }
    ])


    // Автоматично влизане
    setSession(phone)

    return { ok: true }

  }, [users])


  // ВХОД В ПРОФИЛ

  const login = useCallback(({ phone, password }) => {

    // Проверка на телефона
    if (!validPhone(phone)) {
      return {
        error: 'Номерът трябва да започва с 08 и да е точно 10 цифри.'
      }
    }


    // Проверка на данните
    const found = users.find(
      (u) => u.phone === phone && u.password === password
    )


    if (!found) {
      return {
        error: 'Грешен номер или парола.'
      }
    }


    // Запазване на сесията
    setSession(phone)

    return { ok: true }

  }, [users])


  // ИЗХОД ОТ ПРОФИЛ

  const logout = useCallback(() => {
    setSession(null)
  }, [])


  // СЪЗДАВАНЕ И ПРОМЯНА НА РЕЗЕРВАЦИИ

  const book = useCallback(
    ({ businessId, resourceId, date, start }, replaceId = null) => {

      // Проверка дали потребителят е влязъл
      if (!session) {
        return {
          error: 'Влезте в профила си, за да резервирате.'
        }
      }


      // Намиране на бизнеса
      const b = BUSINESS_MAP[businessId]

      const res = b?.resources.find(
        (r) => r.id === resourceId
      )


      // Проверка на бизнеса и ресурса
      if (!b || !res) {
        return {
          error: 'Невалиден бизнес или ресурс.'
        }
      }


      // Проверка на работния ден
      const d = new Date(date + 'T00:00:00')

      if (!isWorkingDay(b, d)) {
        return {
          error: 'Този ден не е работен.'
        }
      }


      // Проверка на работното време
      if (!slotsFor(b).includes(start)) {
        return {
          error: 'Часът е извън работното време.'
        }
      }


      // Проверка дали часът не е минал
      if (isPast(date, start)) {
        return {
          error: 'Този час вече е минал.'
        }
      }


      // Изключване на старата резервация при редакция
      const others = bookings.filter(
        (x) => x.id !== replaceId
      )


      // Проверка дали часът е свободен
      const taken = buildIndex(others).get(
        slotKey(businessId, resourceId, date, start)
      ) || 0


      if (taken >= res.capacity) {
        return {
          error: 'Часът току-що беше зает. Изберете друг.'
        }
      }


      // Проверка за друга резервация на потребителя
      const alreadyBooked = others.some(
        (x) =>
          x.userPhone === session &&
          x.date === date &&
          x.start === start
      )


      if (alreadyBooked) {
        return {
          error: 'Вече имате резервация за този час.'
        }
      }


      // Създаване на резервацията
      const entry = {
        id: replaceId || crypto.randomUUID(),
        userPhone: session,
        businessId,
        resourceId,
        date,
        start
      }


      // Запазване или редактиране
      setBookings(
        replaceId
          ? others.concat(entry)
          : [...others, entry]
      )

      return { ok: true }

    },
    [bookings, session]
  )


  // ОТМЕНЯНЕ НА РЕЗЕРВАЦИЯ

  const cancel = useCallback((id) => {

    setBookings((list) =>
      list.filter((x) => x.id !== id)
    )

  }, [])


  // СПОДЕЛЕНИ ДАННИ И ФУНКЦИИ

  const value = useMemo(
    () => ({
      user,
      register,
      login,
      logout,
      bookings,
      myBookings,
      index,
      book,
      cancel
    }),
    [
      user,
      register,
      login,
      logout,
      bookings,
      myBookings,
      index,
      book,
      cancel
    ]
  )

  // ПРЕДОСТАВЯНЕ НА STORE

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  )

}
