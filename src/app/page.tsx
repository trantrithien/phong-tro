'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CaretRight, DoorOpen, Plus } from '@phosphor-icons/react'
import { createClient } from '@/lib/supabase'
import { AppHeader } from '@/components/app-header'
import { RoomBadge } from '@/components/status-badge'
import type { Phong } from '@/lib/types'
import { btnPrimary, btnSecondary, inputCls, labelCls, vnd } from '@/lib/ui'

export default function HomePage() {
  const [phongs, setPhongs] = useState<Phong[]>([])
  const [conNo, setConNo] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [maPhong, setMaPhong] = useState('')
  const [giaThue, setGiaThue] = useState('')
  const [formError, setFormError] = useState('')
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const [p, h] = await Promise.all([
      supabase.from('phong').select('*').order('ma_phong'),
      supabase.from('hoa_don').select('tong_tien').eq('da_thu', false),
    ])
    setError(p.error ? 'Không tải được danh sách phòng. Hãy tải lại trang.' : '')
    setPhongs((p.data ?? []) as Phong[])
    setConNo(
      ((h.data ?? []) as { tong_tien: number }[]).reduce((s, x) => s + Number(x.tong_tien), 0)
    )
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    load()
  }, [load])

  async function themPhong(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('phong').insert({
      chu_tro_id: user.id,
      ma_phong: maPhong.trim(),
      gia_thue: Number(giaThue),
    })
    if (error) {
      setFormError('Không lưu được phòng. Hãy thử lại.')
      return
    }
    setMaPhong('')
    setGiaThue('')
    setShowForm(false)
    await load()
  }

  const soTrong = phongs.filter((p) => p.trang_thai === 'trong').length
  const soDangThue = phongs.length - soTrong

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Tổng quan</h1>

        <dl className="mt-6 grid divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { label: 'Phòng trống', value: String(soTrong) },
            { label: 'Đang thuê', value: String(soDangThue) },
            { label: 'Tiền chưa thu', value: vnd(conNo) },
          ].map((s) => (
            <div key={s.label} className="px-6 py-5">
              <dt className="text-sm text-zinc-600">{s.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {loading ? <span className="inline-block h-9 w-16 animate-pulse rounded-lg bg-zinc-100" /> : s.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Danh sách phòng</h2>
          <button onClick={() => setShowForm(!showForm)} className={btnPrimary}>
            <Plus size={18} />
            Thêm phòng
          </button>
        </div>

        {showForm && (
          <form onSubmit={themPhong} className="mt-4 rounded-xl border border-zinc-200 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ma" className={labelCls}>Mã phòng</label>
                <input
                  id="ma"
                  required
                  className={inputCls}
                  placeholder="Ví dụ: P101"
                  value={maPhong}
                  onChange={(e) => setMaPhong(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="gia" className={labelCls}>Giá thuê mỗi tháng (đ)</label>
                <input
                  id="gia"
                  type="number"
                  required
                  min={0}
                  className={inputCls}
                  placeholder="Ví dụ: 2000000"
                  value={giaThue}
                  onChange={(e) => setGiaThue(e.target.value)}
                />
              </div>
            </div>
            {formError && <p role="alert" className="mt-3 text-sm text-red-700">{formError}</p>}
            <div className="mt-5 flex gap-2">
              <button type="submit" className={btnPrimary}>Lưu</button>
              <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Hủy</button>
            </div>
          </form>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}

        <div className="mt-4 divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
                  <div className="h-3.5 w-32 animate-pulse rounded bg-zinc-100" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-100" />
              </div>
            ))
          ) : phongs.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-600">
                <DoorOpen size={24} />
              </span>
              <p className="mt-4 font-medium">Chưa có phòng nào</p>
              <p className="mt-1 text-sm text-zinc-600">Thêm phòng đầu tiên để bắt đầu theo dõi.</p>
              <button onClick={() => setShowForm(true)} className={`${btnPrimary} mt-5`}>
                <Plus size={18} />
                Thêm phòng
              </button>
            </div>
          ) : (
            phongs.map((p) => (
              <Link
                key={p.id}
                href={`/phong/${p.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-50"
              >
                <div>
                  <p className="font-medium">Phòng {p.ma_phong}</p>
                  <p className="mt-0.5 text-sm tabular-nums text-zinc-600">{vnd(p.gia_thue)} / tháng</p>
                </div>
                <div className="flex items-center gap-3">
                  <RoomBadge status={p.trang_thai} />
                  <CaretRight size={16} className="text-zinc-400" aria-hidden />
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}