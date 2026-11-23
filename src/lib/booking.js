// Чиста логика без React – лесна за тестване и бърза.

export const pad = (n) => String(n).padStart(2, '0')
export const fmtTime = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`

// Локална дата във формат YYYY-MM-DD (без проблеми с часови зони)
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const nextDays = (count = 14) => {
  const out = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    out.push({ iso: toISO(d), date: d })
  }
  return out
}

// Всички слотове за ден: [540, 570, 600, ...] (минути от полунощ)
export const slotsFor = (b) => {
  const out = []
  for (let m = b.open * 60; m + b.slot <= b.close * 60; m += b.slot) out.push(m)
  return out
}

export const isWorkingDay = (b, date) => b.days.includes(date.getDay())

export const slotKey = (businessId, resourceId, date, start) =>
  `${businessId}|${resourceId}|${date}|${start}`

// Индекс Map: ключ на слот -> брой резервации. Проверката за наличност е O(1).
export const buildIndex = (bookings) => {
  const map = new Map()
  for (const bk of bookings) {
    const k = slotKey(bk.businessId, bk.resourceId, bk.date, bk.start)
    map.set(k, (map.get(k) || 0) + 1)
  }
  return map
}

export const isPast = (isoDate, startMin) => {
  const now = new Date()
  if (isoDate < toISO(now)) return true
  return isoDate === toISO(now) && startMin <= now.getHours() * 60 + now.getMinutes()
}

// Валидация на телефон: започва с 08 и е точно 10 цифри
export const PHONE_RE = /^08\d{8}$/
export const validPhone = (p) => PHONE_RE.test(p)
export const BG_DAYS = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
