// Всеки бизнес е само конфигурация. Системата не знае нищо за бръснар или зъболекар
// resources – какво се резервира (човек, кабинет, зона)
// capacity  – колко резервации може да поеме един ресурс в един слот
// open/close – работно време (часове) slot – дължина на слот (минути)
// days – работни дни (0 = неделя 6 = събота)
export const BUSINESSES = [
  {
    id: 'barber',
    name: 'Barber Shop "Bonny & Clyde"“',
    type: 'Бръснарница',
    emoji: '💈',
    address: 'Градински, ул. "Иван Вазов" 13Б, 6008 Стара Загора',
    description: 'Подстригване, оформяне на брада и класическо бръснене.',
    resourceLabel: 'Бръснар',
    resources: [
      { id: 'ivan', name: 'Иван', capacity: 1 },
      { id: 'todor', name: 'Тодор', capacity: 1 },
    ],
    open: 9, close: 19, slot: 30, days: [1, 2, 3, 4, 5, 6],
    colors: ['#0f766e', '#14b8a6'],
  },
  {
    id: 'dental',
    name: 'Зъболекарски „О.СЕМ“',
    type: 'Зъболекарски кабинет',
    emoji: '🦷',
    address: 'ул. „Сава Силов“ 80',
    description: 'Прегледи, профилактика и лечение. Час по предварително запазване.',
    resourceLabel: 'Кабинет',
    resources: [
      { id: 'room1', name: 'Кабинет 1', capacity: 1 },
      { id: 'room2', name: 'Кабинет 2', capacity: 1 },
    ],
    open: 8, close: 17, slot: 60, days: [1, 2, 3, 4, 5],
    colors: ['#1d4ed8', '#60a5fa'],
  },
  {
    id: 'restaurant',
    name: 'Ресторант „Кошарите“',
    type: 'Ресторант',
    emoji: '🍝',
    Image: '/images/Кошарите.jpg',
    
    address: 'ул. „Загорка“ № 35, кв. Железник, Стара Загора',
    description: 'Традиционни български ястия, балканска скара, сачове, специалитети, салати, супи и пици.',
    resourceLabel: 'Зона',
    resources: [
      { id: 'hall', name: 'Вътрешна зала', capacity: 6 },
      { id: 'terrace', name: 'Тераса', capacity: 4 },
    ],
    open: 12, close: 22, slot: 60, days: [0, 1, 2, 3, 4, 5, 6],
    colors: ['#b45309', '#f59e0b'],
  },
]

export const BUSINESS_MAP = Object.fromEntries(BUSINESSES.map((b) => [b.id, b]))
