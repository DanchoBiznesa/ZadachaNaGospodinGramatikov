import { useState } from 'react'
import Modal from './Modal.jsx'
import { useStore } from '../store.jsx'

export default function AuthModal({ onClose, onSuccess, reason }) {
  const { login, register } = useStore()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', phone: '', password: '' })
  const [error, setError] = useState('')

  const set = (k) => (e) => {
    let v = e.target.value
    if (k === 'phone') v = v.replace(/\D/g, '').slice(0, 10)
    setForm((f) => ({ ...f, [k]: v }))
    setError('')
  }

  const submit = (e) => {
    e.preventDefault()
    const res = mode === 'login' ? login(form) : register(form)
    if (res.error) return setError(res.error)
    onSuccess?.()
    onClose()
  }

  return (
    <Modal title="Вход и регистрация" onClose={onClose}>
      <h2>{mode === 'login' ? 'Добре дошли отново' : 'Създайте профил'}</h2>
      <p className="muted">{reason || 'Влезте, за да управлявате резервациите си.'}</p>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''}
          onClick={() => { setMode('login'); setError('') }}>Вход</button>
        <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'on' : ''}
          onClick={() => { setMode('register'); setError('') }}>Регистрация</button>
      </div>

      <form onSubmit={submit} noValidate>
        {mode === 'register' && (
          <label>Име
            <input value={form.name} onChange={set('name')} placeholder="Иван Иванов" autoComplete="name" />
          </label>
        )}
        <label>Телефон
          <input value={form.phone} onChange={set('phone')} inputMode="numeric"
            placeholder="0888123456" autoComplete="tel" />
          <small className={form.phone && !/^08\d{8}$/.test(form.phone) ? 'hint bad' : 'hint'}>
            Въведете правилен номер. ({form.phone.length}/10)
          </small>
        </label>
        <label>Парола
          <input type="password" value={form.password} onChange={set('password')}
            placeholder="Поне 6 символа"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </label>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="btn primary wide" type="submit">
          {mode === 'login' ? 'Вход' : 'Създай профил'}
        </button>
      </form>
    </Modal>
  )
}
