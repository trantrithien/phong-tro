'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Buildings } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import { btnPrimary, inputCls, labelCls } from '@/lib/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'error' | 'ok'; text: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      setMsg(
        error
          ? { type: 'error', text: error.message }
          : { type: 'ok', text: 'Đăng ký thành công. Bạn có thể đăng nhập ngay.' }
      )
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg({ type: 'error', text: error.message })
      else router.push('/')
    }
    setLoading(false)
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-zinc-900 p-12 text-zinc-100 lg:flex">
        <div className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-emerald-700 text-white">
            <Buildings size={18} />
          </span>
          Quản lý phòng trọ
        </div>
        <div>
          <h2 className="max-w-md text-4xl font-semibold leading-tight tracking-tight">
            Biết ngay phòng nào còn nợ tiền.
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-zinc-300">
            Theo dõi phòng, người thuê và hóa đơn điện nước hằng tháng ở một nơi.
          </p>
        </div>
        <p className="text-sm text-zinc-400">Đồ án môn học</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 font-semibold tracking-tight lg:hidden">
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-700 text-white">
              <Buildings size={18} />
            </span>
            Quản lý phòng trọ
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600">
            {isRegister ? 'Dùng email để quản lý phòng trọ của bạn.' : 'Chào mừng bạn quay lại.'}
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className={labelCls}>Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className={inputCls}
                placeholder="ten@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelCls}>Mật khẩu</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className={inputCls}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {msg && (
            <p
              role="alert"
              className={`mt-4 text-sm ${msg.type === 'error' ? 'text-red-700' : 'text-emerald-800'}`}
            >
              {msg.text}
            </p>
          )}

          <button type="submit" disabled={loading} className={`${btnPrimary} mt-6 w-full`}>
            {loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
          </button>

          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setMsg(null) }}
            className="mt-5 w-full text-center text-sm font-medium text-emerald-800 hover:underline"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </button>
        </form>
      </section>
    </main>
  )
}